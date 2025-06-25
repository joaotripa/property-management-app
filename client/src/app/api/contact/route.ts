import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createContactEmailTemplate, createPlainContactEmail } from "@/lib/email-templates/contact-form";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ResendError {
  message: string;
  statusCode: number;
  name: string;
}

function validateEnvironment(): { isValid: boolean; error?: NextResponse } {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable");
    return {
      isValid: false,
      error: NextResponse.json(
        { success: false, message: "Email service is not configured. Please try again later." },
        { status: 500 }
      )
    };
  }
  return { isValid: true };
}

function validateFormData(data: ContactFormData): { isValid: boolean; error?: NextResponse } {
  const { name, email, subject, message } = data;
  
  if (!name?.trim()) {
    return {
      isValid: false,
      error: NextResponse.json(
        { success: false, message: "Please enter your name." },
        { status: 400 }
      )
    };
  }
  
  if (!email?.trim() || !email.includes("@")) {
    return {
      isValid: false,
      error: NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      )
    };
  }
  
  if (!subject?.trim()) {
    return {
      isValid: false,
      error: NextResponse.json(
        { success: false, message: "Please enter a subject." },
        { status: 400 }
      )
    };
  }
  
  if (!message?.trim() || message.length < 10) {
    return {
      isValid: false,
      error: NextResponse.json(
        { success: false, message: "Please enter a message (at least 10 characters)." },
        { status: 400 }
      )
    };
  }
  
  return { isValid: true };
}

function getErrorMessage(error: ResendError): string {
  switch (error.statusCode) {
    case 400:
      return "Invalid email address. Please check and try again.";
    case 401:
      return "Email service authentication failed. Please try again later.";
    case 403:
      return "Email service access denied. Please try again later.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "Email service is temporarily unavailable. Please try again later.";
    default:
      return "Unable to send email. Please try again later.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      return envValidation.error!;
    }

    const formData: ContactFormData = await req.json();
    const formValidation = validateFormData(formData);
    if (!formValidation.isValid) {
      return formValidation.error!;
    }

    console.log("Processing contact form submission:", { 
      name: formData.name,  
      email: formData.email, 
      subject: formData.subject 
    });

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [process.env.EMAIL_TO!],
      subject: `New Message from ${formData.name} - ${formData.subject}`,
      html: createContactEmailTemplate(formData),
      text: createPlainContactEmail(formData),
      replyTo: formData.email,
    });

    if (error) {
      console.error("Resend API error:", error);
      const userMessage = getErrorMessage(error as ResendError);
      return NextResponse.json(
        { success: false, message: userMessage },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", { id: data?.id });
    return NextResponse.json({ 
      success: true, 
      message: "Thank you for your message! We'll get back to you soon." 
    });

  } catch (error) {
    console.error("Contact form error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("JSON")) {
        return NextResponse.json(
          { success: false, message: "Invalid request format. Please try again." },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
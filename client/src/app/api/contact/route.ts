import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/services/server/emailService";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
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


export async function POST(req: NextRequest) {
  try {
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

    const result = await sendContactEmail(formData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Unable to send email. Please try again later." },
        { status: 500 }
      );
    }

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
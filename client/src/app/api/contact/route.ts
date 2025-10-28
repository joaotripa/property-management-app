import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/services/server/emailService";
import { contactFormSchema } from "@/lib/validations/contact";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const formData = contactFormSchema.parse(body);

    console.log("Processing contact form submission:", {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
    });

    const result = await sendContactEmail(formData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to send email. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        {
          success: false,
          message: firstError?.message || "Invalid form data.",
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("JSON")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format. Please try again.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
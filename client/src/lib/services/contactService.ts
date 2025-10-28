import { ContactFormData } from "@/lib/validations/contact";

interface ContactResponse {
  success: boolean;
  message: string;
}

export async function sendContactMessage(
  data: ContactFormData
): Promise<ContactResponse> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to send message. Please try again.",
      };
    }

    return result;
  } catch (error) {
    console.error("Contact service error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

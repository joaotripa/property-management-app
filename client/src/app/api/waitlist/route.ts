import { NextRequest, NextResponse } from "next/server";

const baseUrl = "https://api.beehiiv.com/v2/publications";

function validateEnvironment(): { isValid: boolean; error?: NextResponse } {
  if (!process.env.BEEHIIV_API_KEY || !process.env.BEEHIIV_PUBLICATION_ID) {
    console.error("Missing environment variables:", {
      hasApiKey: !!process.env.BEEHIIV_API_KEY,
      hasPublicationId: !!process.env.BEEHIIV_PUBLICATION_ID
    });
    return {
      isValid: false,
      error: NextResponse.json(
        { success: false, message: "Server configuration error", status: 500 },
        { status: 500 }
      )
    };
  }
  return { isValid: true };
}

function validateEmail(email: string): { isValid: boolean; error?: NextResponse } {
  if (!email || !email.includes("@")) {
    return {
      isValid: false,
      error: NextResponse.json(
        { success: false, message: "Invalid email", status: 400 },
        { status: 400 }
      )
    };
  }
  return { isValid: true };
}

async function checkSubscriberExists(email: string): Promise<{ exists: boolean; data?: any }> {
  
  const encodedEmail = encodeURIComponent(email);
  const response = await fetch(
    `${baseUrl}/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions/by_email/${encodedEmail}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    return { exists: true, data };
  }

  if (response.status === 404) {
    return { exists: false };
  }

  throw new Error(`Unexpected response when checking subscriber: ${response.status}`);
}

async function createSubscriber(email: string): Promise<{ success: boolean; data?: any; error?: NextResponse }> {
  
  const response = await fetch(
    `${baseUrl}/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
      }),
    }
  );

  console.log("Beehiiv API response status:", response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Beehiiv API error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    
    const userMessage = getErrorMessage(response.status, errorData);
    
    return {
      success: false,
      error: NextResponse.json(
        { 
          success: false, 
          message: userMessage,
          status: response.status
        },
        { status: response.status }
      )
    };
  }

  const result = await response.json();
  console.log("Successfully added subscriber:", result);
  
  return { success: true, data: result };
}

function getErrorMessage(status: number, errorData: any): string {
  if (status === 422 || (errorData.message && errorData.message.includes("invalid"))) {
    return "Please enter a valid email address.";
  } else if (status >= 500) {
    return "Our servers are busy. Please try again in a few minutes.";
  }
  return "We're experiencing technical difficulties. Please try again later.";
}

export async function POST(req: NextRequest) {
  try {
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      return envValidation.error!;
    }

    const { email } = await req.json();
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return emailValidation.error!;
    }

    console.log("Attempting to add subscriber:", email);

    const subscriberCheck = await checkSubscriberExists(email);
    
    if (subscriberCheck.exists) {
      console.log("Subscriber already exists:", email);
      return NextResponse.json({ 
        success: false, 
        message: "You're already on our waitlist! We'll keep you posted when Domari launches.",
        status: 409
      }, { status: 409 });
    }

    const createResult = await createSubscriber(email);
    
    if (!createResult.success) {
      return createResult.error!;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Unexpected error in waitlist API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", status: 500 },
      { status: 500 }
    );
  }
}
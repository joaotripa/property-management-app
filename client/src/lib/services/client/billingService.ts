import { SubscriptionPlan } from "@prisma/client";
import { getPaymentLink as getPaymentLinkFromConfig } from "@/lib/stripe/config";

export class BillingServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "BillingServiceError";
  }
}

interface CreatePortalSessionParams {
  plan: SubscriptionPlan;
  isYearly: boolean;
}

interface CreatePortalSessionResponse {
  url: string;
}

export async function createPortalSession({
  plan,
  isYearly,
}: CreatePortalSessionParams): Promise<CreatePortalSessionResponse> {
  try {
    const response = await fetch(
      `/api/billing/portal?plan=${plan}&isYearly=${isYearly}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new BillingServiceError(
        errorData.error || "Failed to create portal session",
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof BillingServiceError) {
      throw error;
    }
    throw new BillingServiceError(
      "Something went wrong. Please try again."
    );
  }
}

interface GetPaymentLinkParams {
  plan: SubscriptionPlan;
  isYearly: boolean;
  customerEmail?: string;
}

export function getPaymentLink({
  plan,
  isYearly,
  customerEmail,
}: GetPaymentLinkParams): string {
  return getPaymentLinkFromConfig(plan, isYearly, customerEmail);
}

interface CancelSubscriptionNowResponse {
  success: boolean;
  message?: string;
}

export async function cancelSubscriptionNow(): Promise<CancelSubscriptionNowResponse> {
  try {
    const response = await fetch("/api/billing/cancel-now", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new BillingServiceError(
        errorData.error || "Failed to cancel subscription",
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof BillingServiceError) {
      throw error;
    }
    throw new BillingServiceError(
      "Something went wrong. Please try again."
    );
  }
}

interface UpdateSubscriptionParams {
  plan: SubscriptionPlan;
  isYearly: boolean;
}

interface UpdateSubscriptionResponse {
  success: boolean;
  message: string;
}

export async function updateSubscription({
  plan,
  isYearly,
}: UpdateSubscriptionParams): Promise<UpdateSubscriptionResponse> {
  try {
    const response = await fetch(
      `/api/billing/checkout?plan=${plan}&isYearly=${isYearly}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new BillingServiceError(
        errorData.error || "Failed to update subscription",
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof BillingServiceError) {
      throw error;
    }
    throw new BillingServiceError(
      "Something went wrong. Please try again."
    );
  }
}
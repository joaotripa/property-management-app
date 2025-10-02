import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SubscriptionPlan } from '@prisma/client';
import { createCheckoutSession } from '@/lib/stripe/services/checkout.service';
import { handleSubscriptionError, isSubscriptionError, InvalidPlanError } from '@/lib/stripe/core/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, isYearly } = body;

    if (!plan || !['STARTER', 'PRO', 'BUSINESS'].includes(plan)) {
      throw new InvalidPlanError(plan);
    }

    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      plan: plan as SubscriptionPlan,
      isYearly: Boolean(isYearly),
      successUrl: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings?canceled=true`,
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    if (error instanceof Error && isSubscriptionError(error)) {
      const errorResponse = handleSubscriptionError(error);
      return NextResponse.json(
        {
          success: false,
          error: errorResponse.message,
          code: errorResponse.code,
        },
        { status: errorResponse.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
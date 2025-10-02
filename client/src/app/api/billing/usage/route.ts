import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSubscriptionStatus } from '@/lib/stripe/services/subscription.service';
import { checkResourceLimit, getAllResourceUsage } from '@/lib/stripe/services/limits.service';
import { getDaysRemainingInTrial } from '@/lib/stripe/config/trial.config';
import { handleSubscriptionError, isSubscriptionError } from '@/lib/stripe/core/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await getSubscriptionStatus(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const propertyLimits = await checkResourceLimit(session.user.id, 'properties');
    const trialDaysRemaining =
      subscription.status === 'TRIAL'
        ? getDaysRemainingInTrial(subscription.trialEndsAt)
        : null;

    const allResourceUsage = await getAllResourceUsage(session.user.id);

    return NextResponse.json({
      success: true,
      subscription: {
        status: subscription.status,
        plan: subscription.plan,
        propertyLimit: subscription.propertyLimit,
        trialEndsAt: subscription.trialEndsAt,
        trialDaysRemaining,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      usage: {
        propertyCount: propertyLimits.currentUsage,
        propertyLimit: propertyLimits.limit,
        canCreateProperties: propertyLimits.allowed,
        isAtLimit: propertyLimits.isAtLimit,
      },
      resourceUsage: allResourceUsage,
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
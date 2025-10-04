import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSubscriptionInfo, checkLimit } from '@/lib/stripe/subscription';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await getSubscriptionInfo(session.user.id);

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const limitCheck = await checkLimit(session.user.id);

    return NextResponse.json({
      subscription: {
        status: subscription.status,
        plan: subscription.plan,
        propertyLimit: subscription.propertyLimit,
        trialEndsAt: subscription.trialEndsAt,
        trialDaysRemaining: subscription.trialDaysRemaining,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      usage: {
        propertyCount: limitCheck.current,
        propertyLimit: limitCheck.limit,
        canCreateProperties: limitCheck.allowed,
        isAtLimit: !limitCheck.allowed,
      },
    });
  } catch (error) {
    console.error('Usage error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
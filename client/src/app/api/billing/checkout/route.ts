import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { updateSubscriptionPlan, checkLimit, getPriceId } from '@/lib/stripe/server';
import { prisma } from '@/lib/config/database';
import { getLimit } from '@/lib/stripe/plans';
import { SubscriptionPlan } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan') as SubscriptionPlan | null;
    const isYearly = searchParams.get('isYearly') === 'true';

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan parameter is required' },
        { status: 400 }
      );
    }

    const priceId = getPriceId(plan, isYearly);
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const currentLimit = getLimit(subscription.plan);
    const newLimit = getLimit(plan);

    if (newLimit < currentLimit) {
      const { current } = await checkLimit(session.user.id);

      if (current > newLimit) {
        return NextResponse.json(
          {
            error: `Cannot downgrade: You have ${current} properties but ${plan} plan allows only ${newLimit}. Please delete some properties first.`,
          },
          { status: 400 }
        );
      }
    }

    const result = await updateSubscriptionPlan({
      userId: session.user.id,
      newPriceId: priceId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

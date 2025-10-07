import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { calculateSubscriptionChange, getPriceId } from '@/lib/stripe/server';
import { SubscriptionPlan } from '@prisma/client';

export async function GET(req: NextRequest) {
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

    const preview = await calculateSubscriptionChange({
      userId: session.user.id,
      newPriceId: priceId,
    });

    return NextResponse.json(preview);
  } catch (error) {
    console.error('Subscription preview error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate subscription preview' },
      { status: 500 }
    );
  }
}

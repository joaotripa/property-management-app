import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SubscriptionPlan } from '@prisma/client';
import { createCheckoutSession } from '@/lib/stripe/subscription';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, isYearly } = await request.json();

    if (!plan || !['STARTER', 'PRO', 'BUSINESS'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const checkout = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      plan: plan as SubscriptionPlan,
      isYearly: Boolean(isYearly),
      successUrl: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings?canceled=true`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
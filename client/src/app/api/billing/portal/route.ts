import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createPortalSession, checkLimit, getPriceId } from '@/lib/stripe/server';
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
    const priceId = searchParams.get('priceId');

    let finalPriceId = priceId;

    // If plan and isYearly are provided, get the priceId from server-side function
    if (plan && !priceId) {
      finalPriceId = getPriceId(plan, isYearly);
      
      if (!finalPriceId) {
        return NextResponse.json(
          { error: 'Invalid plan configuration' },
          { status: 400 }
        );
      }
    }

    // If changing plan, validate property limit for downgrades
    if (finalPriceId) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      });

      if (subscription) {
        // Map priceId to plan
        const priceMappings: Record<string, SubscriptionPlan> = {
          [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '']: 'STARTER',
          [process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '']: 'STARTER',
          [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '']: 'PRO',
          [process.env.STRIPE_PRO_YEARLY_PRICE_ID || '']: 'PRO',
          [process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || '']: 'BUSINESS',
          [process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || '']: 'BUSINESS',
        };

        const targetPlan = priceMappings[finalPriceId];

        if (targetPlan) {
          const newLimit = getLimit(targetPlan);
          const currentLimit = getLimit(subscription.plan);

          // Check if this is a downgrade
          if (newLimit < currentLimit) {
            const { current } = await checkLimit(session.user.id);

            if (current > newLimit) {
              return NextResponse.json(
                {
                  error: `Cannot downgrade: You have ${current} properties but ${targetPlan} plan allows only ${newLimit}`,
                },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    const portal = await createPortalSession({
      userId: session.user.id,
      returnUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings?tab=billing`,
      priceId: finalPriceId || undefined,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
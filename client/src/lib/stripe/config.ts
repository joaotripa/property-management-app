export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  paymentLinks: {
    starter: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_LINK!,
      yearly: process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_LINK!,
    },
    pro: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK!,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK!,
    },
    business: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_LINK!,
      yearly: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_LINK!,
    },
  },

  trial: {
    enabled: true,
    days: 14,
  },
} as const;

export function getPaymentLink(plan: 'STARTER' | 'PRO' | 'BUSINESS', isYearly: boolean): string {
  const planKey = plan.toLowerCase() as 'starter' | 'pro' | 'business';
  const period = isYearly ? 'yearly' : 'monthly';
  return stripeConfig.paymentLinks[planKey][period];
}

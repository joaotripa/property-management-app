import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey && typeof window === 'undefined') {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured');
}

export const stripe = new Stripe(apiKey || 'sk_test_placeholder', {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  prices: {
    starter: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '',
    },
    pro: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    },
    business: {
      monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || '',
    },
  },

  trial: {
    enabled: true,
    days: 14,
  },
} as const;

# Stripe Integration - Reusability Guide (MVP Approach)

This Stripe implementation is production-ready, follows MVP best practices, and is designed to be reused across projects. This guide will help you adapt it for your specific needs.

## ✨ Features

- ✅ **Trial subscriptions** with configurable duration
- ✅ **Payment Links** for initial purchases (Stripe-hosted, zero maintenance)
- ✅ **Billing Portal** for all subscription management (upgrades, downgrades, cancellations)
- ✅ **Automatic customer creation** when first payment occurs
- ✅ **Complete webhook handling** for all subscription lifecycle events
- ✅ **Resource limit enforcement** (easily customizable)
- ✅ **Full TypeScript support** with Stripe SDK types
- ✅ **Production-tested** MVP approach following industry best practices

## 🎯 MVP Philosophy

This implementation follows the **MVP (Minimum Viable Product)** approach:

- **Initial subscriptions**: Handled via Stripe Payment Links
- **All subsequent changes**: Managed through Stripe Billing Portal
- **Zero custom UI** for plan changes after initial purchase
- **Fully managed by Stripe**: Upgrades, downgrades, cancellations, payment methods
- **Focus on core business**: Let Stripe handle the complexity

## 🚀 Quick Start for New Project

### 1. Copy Required Files

```bash
# Core Stripe logic
cp client/src/lib/stripe/server.ts YOUR_PROJECT/src/lib/stripe/
cp client/src/lib/stripe/config.ts YOUR_PROJECT/src/lib/stripe/
cp client/src/lib/stripe/plans.ts YOUR_PROJECT/src/lib/stripe/

# API routes
cp client/src/app/api/billing/webhooks/route.ts YOUR_PROJECT/src/app/api/billing/webhooks/
cp client/src/app/api/billing/portal/route.ts YOUR_PROJECT/src/app/api/billing/portal/
cp client/src/app/api/billing/cancel-now/route.ts YOUR_PROJECT/src/app/api/billing/cancel-now/ # Optional: for immediate cancellation
```

### 2. Environment Variables

Add to `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (create in Stripe Dashboard)
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_...

# Payment Links (optional - for Stripe-hosted checkout)
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_STARTER_YEARLY_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_LINK=https://buy.stripe.com/...

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Database Schema

Add to your Prisma schema:

```prisma
model Subscription {
  id                       String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId                   String             @unique @map("user_id") @db.Uuid
  stripeCustomerId         String?            @map("stripe_customer_id")
  stripeSubscriptionId     String?            @map("stripe_subscription_id")
  stripeSubscriptionItemId String?            @map("stripe_subscription_item_id")
  status                   SubscriptionStatus @default(TRIAL)
  plan                     SubscriptionPlan   @default(BUSINESS)
  propertyLimit            Int                @default(999) @map("property_limit")
  trialEndsAt              DateTime?          @map("trial_ends_at") @db.Timestamptz(6)
  currentPeriodStart       DateTime?          @map("current_period_start") @db.Timestamptz(6)
  currentPeriodEnd         DateTime?          @map("current_period_end") @db.Timestamptz(6)
  cancelAtPeriodEnd        Boolean            @default(false) @map("cancel_at_period_end")
  scheduledPlan            SubscriptionPlan?  @map("scheduled_plan")
  scheduledPlanDate        DateTime?          @map("scheduled_plan_date") @db.Timestamptz(6)
  createdAt                DateTime           @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt                DateTime           @default(now()) @map("updated_at") @db.Timestamptz(6)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
  @@index([status])
  @@map("subscriptions")
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}

enum SubscriptionPlan {
  STARTER
  PRO
  BUSINESS
}
```

## 🔧 Customization Guide

### Change Resource Limits

**1. Update `plans.ts`:**

```typescript
// Change from "properties" to your resource (e.g., "projects", "users", "storage")
export const PLAN_LIMITS = {
  STARTER: 100, // Your limit
  PRO: 500, // Your limit
  BUSINESS: 9999, // Your limit
};
```

**2. Update `server.ts` - `checkLimit()` function:**

```typescript
// Change the count query to your resource
const current = await prisma.yourResource.count({
  where: { userId, deletedAt: null },
});
```

**3. Update Prisma schema field name:**

```prisma
model Subscription {
  // Change propertyLimit to your resource name
  yourResourceLimit Int @default(9999) @map("your_resource_limit")
}
```

### Change Trial Configuration

Edit `config.ts`:

```typescript
export const stripeConfig = {
  trial: {
    enabled: true, // Set to false to disable trials
    days: 14, // Change trial duration
  },
};
```

And in `server.ts` - `createSubscription()`:

```typescript
const defaultPlan: SubscriptionPlan = "BUSINESS"; // Change default trial plan
```

### Add/Remove Plans

**1. Update Prisma enum:**

```prisma
enum SubscriptionPlan {
  FREE      // New plan
  STARTER
  PRO
  BUSINESS
  ENTERPRISE // New plan
}
```

**2. Update `plans.ts`:**

```typescript
export const PLAN_LIMITS = {
  FREE: 5,
  STARTER: 10,
  PRO: 50,
  BUSINESS: 999,
  ENTERPRISE: 99999,
};
```

**3. Add environment variables for new price IDs**

**4. Run migration:**

```bash
npx prisma migrate dev --name add_new_plans
```

## 🛣️ API Routes Overview

The MVP implementation includes only essential API routes:

### `/api/billing/portal` (POST)

**Purpose**: Create Billing Portal session  
**Use when**: User wants to manage subscription, payment methods, view invoices, change plans, cancel  
**Returns**: `{ url }` - Redirect user to Stripe Billing Portal

```typescript
// Frontend usage
const response = await fetch("/api/billing/portal", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});
const { url } = await response.json();
window.location.href = url; // Redirect to Stripe Portal
```

### `/api/billing/cancel-now` (POST) - Optional

**Purpose**: Immediately cancel user's subscription  
**Use when**: You want to provide immediate cancellation in your app (alternative to Billing Portal)  
**Returns**: `{ success: boolean, message: string }`

**Note**: This is optional - Stripe Billing Portal already handles cancellations!

### `/api/billing/webhooks` (POST)

**Purpose**: Handle Stripe webhook events  
**Use when**: Stripe sends subscription lifecycle events (created, updated, deleted, payment succeeded/failed)  
**Note**: Must be publicly accessible for Stripe to call

### `/api/billing/checkout` (POST) - Deprecated

**Status**: Returns 410 Gone  
**Reason**: Custom plan changes are now handled via Stripe Billing Portal  
**Migration**: Direct users to "Manage Subscription" button instead

## 📋 Initial Purchase Flow: Payment Links

**Payment Links** are Stripe-hosted checkout pages - zero code needed!

**Pros:**

- No checkout page to build or maintain
- Fully PCI compliant out of the box
- Stripe handles all UI/UX and edge cases
- Mobile optimized
- Supports 135+ currencies
- Automatically creates customers

**Usage:**

```typescript
import { getPaymentLink } from "@/lib/stripe/config";

const link = getPaymentLink("PRO", true, user.email);
window.location.href = link; // Redirect to Stripe-hosted checkout
```

**Setup in Stripe Dashboard:**

1. Create Payment Links for each plan (monthly & yearly)
2. Configure to collect customer email
3. Set up success/cancel URLs
4. Add the Payment Link URLs to environment variables
5. Webhooks automatically handle the rest!

## 🎯 Common Adaptations

### Change "Properties" to Your Resource

Find and replace in `server.ts`:

- `propertyLimit` → `yourResourceLimit`
- `prisma.property.count` → `prisma.yourResource.count`
- Error messages: "property" → "your resource"

### Add Feature Flags

Add to Prisma schema:

```prisma
model Subscription {
  // ... existing fields
  features Json? // Store as JSON for flexibility
}
```

In `plans.ts`:

```typescript
export const PLAN_FEATURES = {
  STARTER: {
    analytics: false,
    api_access: false,
    team_members: 1,
  },
  PRO: {
    analytics: true,
    api_access: true,
    team_members: 5,
  },
  // ...
};
```

### Change Billing Cycle Pricing

The implementation supports both monthly and yearly by default. To add more:

1. Add new price IDs to environment variables
2. Update `getPriceId()` function in `server.ts`
3. Update frontend pricing displays

### Disable Trials

In `config.ts`:

```typescript
trial: {
  enabled: false,
  days: 0,
},
```

In `server.ts` - `createSubscription()`:

```typescript
status: 'UNPAID', // Instead of 'TRIAL'
trialEndsAt: null,
```

## 🔄 Webhook Testing

### Local Development

1. Install Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe
```

2. Login and forward webhooks:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/billing/webhooks
```

3. Copy the webhook signing secret to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. Trigger test events:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

### Production Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/billing/webhooks`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to production environment variables

## 📊 Monitoring & Logging

The implementation includes console logging for key events:

```typescript
console.log(`📬 Webhook: ${event.type}`);
```

For production, replace `console.log` with your logging service:

```typescript
import { logger } from "@/lib/logger"; // Your logging service

logger.info("webhook_received", { type: event.type, id: event.id });
```

Recommended logs to monitor:

- Webhook failures
- Payment failures
- Subscription cancellations
- Trial expirations
- Upgrade/downgrade patterns

## 🛡️ Security Best Practices

✅ **Webhook signature verification** - Always enabled
✅ **User authentication** - All routes protected
✅ **Idempotency** - Stripe handles retries safely
✅ **Error handling** - Graceful failures with user-friendly messages
✅ **Metadata validation** - User ID stored in Stripe metadata
✅ **Email verification** - Fallback user lookup by email

## 📚 API Reference

### Core Functions

```typescript
// Create trial subscription on signup
createSubscription(userId: string)

// Create checkout session for purchase
createCheckoutSession({ userId, priceId, successUrl, cancelUrl })

// Get billing portal URL
createPortalSession({ userId, returnUrl })

// Check if user can create more resources
checkLimit(userId: string)

// Check if user can perform mutations
canMutate(userId: string)

// Cancel subscription immediately (optional - Billing Portal handles this too)
cancelSubscriptionNow(userId: string)

// Get subscription info with usage
getSubscriptionInfo(userId: string)

// Get price ID for plan
getPriceId(plan: SubscriptionPlan, isYearly: boolean)
```

**Removed Functions (now handled by Stripe Billing Portal):**

- `calculateSubscriptionChange()` - No longer needed (portal handles preview)
- `updateSubscriptionPlan()` - No longer needed (portal handles all changes)
- `upgradeSubscription()` - No longer needed (portal handles upgrades)
- `downgradeSubscription()` - No longer needed (portal handles downgrades)

## 🐛 Troubleshooting

### Webhook not firing locally

```bash
# Check Stripe CLI is running
stripe listen --forward-to localhost:3000/api/billing/webhooks

# Verify ngrok/tunneling if using cloud services
```

### "No user found" in webhooks

- Ensure `userId` is in subscription metadata
- Check customer email matches user table
- Verify user exists before subscription creation

### Billing Portal not working

- Verify customer has `stripeCustomerId` in database
- Check Billing Portal is configured in Stripe Dashboard
- Ensure customer has an active subscription
- Verify return URL is correct

## 🎓 Learning Resources

- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Subscription Schedules](https://stripe.com/docs/billing/subscriptions/subscription-schedules)
- [Proration Behavior](https://stripe.com/docs/billing/subscriptions/prorations)

## 💡 Pro Tips

1. **Always test with Stripe test mode** before going live
2. **Use Stripe CLI** for local webhook testing
3. **Monitor webhook failures** in Stripe Dashboard
4. **Set up alerts** for failed payments
5. **Test all flows**: trial → paid, upgrade, downgrade, cancel
6. **Document your plan limits** clearly for users
7. **Use Stripe's test cards** for different scenarios
8. **Enable Stripe Radar** for fraud prevention
9. **Consider Stripe Tax** for automatic tax calculation
10. **Use metadata** liberally for debugging

## 📞 Support

For Stripe-specific questions:

- [Stripe Support](https://support.stripe.com/)
- [Stripe Discord](https://stripe.com/discord)

For implementation questions, refer to the detailed comments in `server.ts`.

---

**Built with ❤️ for reusability. Adapt it, extend it, make it yours!**

# Stripe Subscription Integration

A production-ready, reusable Stripe subscription system with flexible resource limiting, configuration-driven plans, and complete TypeScript type safety.

## Features

✅ **Fully Type-Safe** - Zero `any` or `unknown` types
✅ **Configuration-Driven** - Easy to customize for any business model
✅ **Resource Limiting** - Flexible system for limiting any resource type
✅ **Webhook Handling** - Robust webhook processing with proper error handling
✅ **Structured Logging** - Built-in observability
✅ **Middleware Support** - Easy API route protection
✅ **Trial Management** - Configurable trial periods
✅ **Error Handling** - Custom error classes for all scenarios

## Architecture

```
lib/stripe/
├── core/                    # Core utilities
│   ├── client.ts           # Stripe client instance
│   ├── types.ts            # TypeScript types
│   ├── errors.ts           # Custom error classes
│   └── logger.ts           # Structured logging
├── config/                  # Configuration files
│   ├── plans.config.ts     # Plan definitions & pricing
│   ├── features.config.ts  # Feature flags & limits
│   ├── trial.config.ts     # Trial settings
│   └── webhooks.config.ts  # Webhook handlers
├── services/                # Business logic
│   ├── subscription.service.ts  # Subscription CRUD
│   ├── checkout.service.ts      # Checkout sessions
│   ├── portal.service.ts        # Customer portal
│   ├── webhook.service.ts       # Webhook processing
│   └── limits.service.ts        # Resource limiting
├── middleware/              # API middleware
│   └── resourceLimit.ts    # Limit enforcement
└── index.ts                # Barrel exports
```

## Quick Start

### 1. Configure Plans

Edit `lib/stripe/config/plans.config.ts`:

```typescript
export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 9,
    yearlyPrice: 90,
    limits: {
      properties: 10,      // Your resource limits
      transactions: 1000,
      storage: 1024,       // MB
      api_calls: 10000,
      team_members: 1,
    },
    // ...
  },
  // Add more plans...
};
```

### 2. Configure Trial

Edit `lib/stripe/config/trial.config.ts`:

```typescript
export const TRIAL_CONFIG: TrialConfig = {
  enabled: true,
  durationDays: 14,
  defaultPlan: 'BUSINESS',
  requirePaymentMethod: false,
};
```

### 3. Add Resource Types

Edit `lib/stripe/core/types.ts` to add new resource types:

```typescript
export type ResourceType =
  | 'properties'
  | 'transactions'
  | 'storage'
  | 'api_calls'
  | 'team_members'
  | 'your_new_resource'; // Add here
```

Then configure limits in `lib/stripe/config/features.config.ts`:

```typescript
export const RESOURCE_LIMIT_CONFIGS: Record<ResourceType, ResourceLimitConfig> = {
  your_new_resource: {
    resourceType: 'your_new_resource',
    strategy: 'count', // or 'sum' or 'custom'
  },
};
```

### 4. Environment Variables

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
```

## Usage Examples

### Protect API Route with Resource Limit

```typescript
import { withResourceLimit } from '@/lib/stripe/middleware/resourceLimit';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Enforce limit before allowing operation
  const limitError = await withResourceLimit(session.user.id, 'properties');
  if (limitError) return limitError;

  // Proceed with creating resource
  // ...
}
```

### Check Resource Usage

```typescript
import { checkResourceLimit, getAllResourceUsage } from '@/lib/stripe';

// Check single resource
const propertyLimit = await checkResourceLimit(userId, 'properties');
console.log(`Using ${propertyLimit.currentUsage} of ${propertyLimit.limit}`);

// Get all resource usage
const allUsage = await getAllResourceUsage(userId);
console.log(allUsage.properties.usagePercentage);
```

### Create Checkout Session

```typescript
import { createCheckoutSession } from '@/lib/stripe';

const session = await createCheckoutSession({
  userId: user.id,
  plan: 'PRO',
  isYearly: true,
  successUrl: '/dashboard?success=true',
  cancelUrl: '/pricing?canceled=true',
});

// Redirect to checkout
window.location.href = session.url;
```

### Get Upgrade Recommendation

```typescript
import { getUpgradeRecommendation } from '@/lib/stripe';

const recommendation = await getUpgradeRecommendation(userId, 'properties');

if (recommendation.shouldUpgrade) {
  console.log(recommendation.reason);
  console.log(`Recommended plan: ${recommendation.recommendedPlan}`);
}
```

## Adding a New Resource Type

### Step 1: Update Type Definition

```typescript
// lib/stripe/core/types.ts
export type ResourceType =
  | 'properties'
  | 'your_new_resource'; // Add your resource
```

### Step 2: Configure Resource Limits

```typescript
// lib/stripe/config/features.config.ts
export const RESOURCE_LIMIT_CONFIGS: Record<ResourceType, ResourceLimitConfig> = {
  your_new_resource: {
    resourceType: 'your_new_resource',
    strategy: 'count', // How to calculate usage
    field: 'size', // Optional: for 'sum' strategy
  },
};
```

### Step 3: Set Limits Per Plan

```typescript
// lib/stripe/config/plans.config.ts
export const PLAN_CONFIGS = {
  STARTER: {
    // ...
    limits: {
      properties: 10,
      your_new_resource: 100, // Add limit
    },
  },
};
```

### Step 4: Implement Usage Calculation

```typescript
// lib/stripe/services/limits.service.ts
async function calculateResourceUsage(
  userId: string,
  resourceType: ResourceType
): Promise<number> {
  switch (resourceType) {
    case 'your_new_resource':
      return await prisma.yourModel.count({
        where: { userId, deletedAt: null },
      });
    // ...
  }
}
```

### Step 5: Protect Your API Route

```typescript
// app/api/your-resource/route.ts
import { withResourceLimit } from '@/lib/stripe/middleware/resourceLimit';

export async function POST(request: NextRequest) {
  const session = await auth();

  const limitError = await withResourceLimit(
    session.user.id,
    'your_new_resource'
  );
  if (limitError) return limitError;

  // Create resource...
}
```

## Customizing Plan Features

### Add Feature Flags

```typescript
// lib/stripe/config/features.config.ts
export const PLAN_FEATURE_FLAGS = {
  STARTER: {
    advanced_analytics: false,
    your_new_feature: false,
  },
  PRO: {
    advanced_analytics: true,
    your_new_feature: true,
  },
};
```

### Check Feature Access

```typescript
import { isFeatureEnabled } from '@/lib/stripe';

if (isFeatureEnabled(userPlan, 'your_new_feature')) {
  // Show feature
}
```

## Webhook Configuration

Webhooks are automatically handled. To add a new webhook:

### Step 1: Create Handler

```typescript
// lib/stripe/services/webhook.service.ts
export async function handleYourNewEvent(
  event: YourEventType
): Promise<{ received: boolean; error?: string }> {
  try {
    // Handle event
    return { received: true };
  } catch (error) {
    return {
      received: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### Step 2: Register Handler

```typescript
// lib/stripe/config/webhooks.config.ts
export const WEBHOOK_HANDLERS: WebhookHandlerRegistry = {
  'customer.subscription.created': handleSubscriptionCreated,
  'your.new.event': handleYourNewEvent, // Add handler
};
```

## Error Handling

All subscription errors are type-safe and provide structured information:

```typescript
import {
  ResourceLimitError,
  TrialExpiredError,
  handleSubscriptionError,
  isSubscriptionError,
} from '@/lib/stripe';

try {
  await enforceResourceLimit(userId, 'properties');
} catch (error) {
  if (isSubscriptionError(error)) {
    const errorResponse = handleSubscriptionError(error);
    return NextResponse.json(
      {
        error: errorResponse.message,
        code: errorResponse.code,
        metadata: errorResponse.metadata,
      },
      { status: errorResponse.statusCode }
    );
  }
}
```

### Available Error Classes

- `SubscriptionError` - Base error class
- `TrialExpiredError` - Trial has ended
- `ResourceLimitError` - Resource limit exceeded
- `InactiveSubscriptionError` - Subscription inactive/canceled
- `SubscriptionNotFoundError` - No subscription found
- `StripeCustomerNotFoundError` - No Stripe customer
- `WebhookSignatureError` - Invalid webhook signature
- `WebhookProcessingError` - Webhook processing failed
- `CheckoutSessionError` - Checkout creation failed
- `PortalSessionError` - Portal creation failed
- `InvalidPlanError` - Invalid plan specified

## Logging & Monitoring

The system includes structured logging:

```typescript
import { logger } from '@/lib/stripe';

// Log subscription events
logger.subscriptionEvent('plan_upgraded', userId, { plan: 'PRO' });

// Log resource limit checks
logger.resourceLimitCheck(userId, 'properties', 5, 10, true);

// Log errors
logger.error('Failed to create checkout', error, { userId, plan });
```

## Testing Checklist

- [ ] Configure all environment variables
- [ ] Create Stripe products and prices
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Test trial creation for new users
- [ ] Test resource limit enforcement
- [ ] Test plan upgrades/downgrades
- [ ] Test payment success/failure webhooks
- [ ] Test subscription cancellation
- [ ] Verify webhook signature validation
- [ ] Test error handling scenarios

## Migration from Old System

If you have existing Stripe integration:

1. **Backup your data** - Export subscriptions and customer data
2. **Update imports** - Change from old imports to new barrel exports
3. **Replace service calls** - Use new service functions
4. **Update API routes** - Use new middleware and error handling
5. **Test thoroughly** - Verify all subscription flows work

## Production Deployment

1. **Environment Variables** - Add all Stripe keys to production environment
2. **Webhook Endpoint** - Register webhook URL in Stripe Dashboard
3. **Database Migration** - Ensure subscription schema is deployed
4. **Monitoring** - Set up alerts for subscription errors
5. **Logging** - Configure log aggregation for subscription events

## Support & Customization

This integration is designed to be highly customizable. Key extension points:

- **Resource types**: Add new resource types easily
- **Plans**: Modify plan structure and pricing
- **Features**: Add feature flags per plan
- **Webhooks**: Add new webhook handlers
- **Limits**: Customize limit calculation strategies
- **Errors**: Add custom error classes

## Best Practices

1. **Always use middleware** for API route protection
2. **Check limits before operations** to provide better UX
3. **Handle errors gracefully** with proper user messages
4. **Log important events** for debugging and analytics
5. **Keep configuration separate** from business logic
6. **Use TypeScript types** for compile-time safety
7. **Test webhook handlers** with Stripe CLI
8. **Monitor subscription metrics** regularly

## License

This integration is part of the Domari project and follows the same license.

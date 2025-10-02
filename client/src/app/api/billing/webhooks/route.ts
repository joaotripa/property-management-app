import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe/services/webhook.service';
import { getWebhookHandler, isWebhookEventSupported } from '@/lib/stripe/config/webhooks.config';
import { handleSubscriptionError, isSubscriptionError } from '@/lib/stripe/core/errors';
import { logger } from '@/lib/stripe/core/logger';
import { StripeWebhookEvent } from '@/lib/stripe/core/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const event = verifyWebhookSignature(body, signature);

    if (!isWebhookEventSupported(event.type)) {
      logger.warn('Unsupported webhook event type', { eventType: event.type });
      return NextResponse.json({ received: true, message: 'Event type not supported' });
    }

    const handler = getWebhookHandler(event.type);
    if (!handler) {
      logger.warn('No handler found for webhook event', { eventType: event.type });
      return NextResponse.json({ received: true, message: 'No handler for event type' });
    }

    const result = await handler(event as StripeWebhookEvent);

    return NextResponse.json(result);
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

    logger.error('Webhook processing failed', error as Error);

    return NextResponse.json(
      {
        success: false,
        error: 'Webhook handler failed',
        code: 'WEBHOOK_ERROR',
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createPortalSession } from '@/lib/stripe/services/portal.service';
import { handleSubscriptionError, isSubscriptionError } from '@/lib/stripe/core/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portalSession = await createPortalSession({
      userId: session.user.id,
      returnUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
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

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
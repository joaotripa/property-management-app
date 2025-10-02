import { NextRequest, NextResponse } from 'next/server';
import { ResourceType } from '../core/types';
import { enforceResourceLimit } from '../services/limits.service';
import { handleSubscriptionError, isSubscriptionError } from '../core/errors';

/**
 * Middleware to enforce resource limits before allowing an operation
 *
 * Usage in API routes:
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const session = await auth();
 *   if (!session?.user?.id) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *
 *   // Enforce resource limit
 *   const limitError = await withResourceLimit(session.user.id, 'properties');
 *   if (limitError) return limitError;
 *
 *   // Proceed with operation
 *   // ...
 * }
 * ```
 */
export async function withResourceLimit(
  userId: string,
  resourceType: ResourceType,
  customErrorMessage?: string
): Promise<NextResponse | null> {
  try {
    await enforceResourceLimit(userId, resourceType, customErrorMessage);
    return null;
  } catch (error) {
    if (error instanceof Error && isSubscriptionError(error)) {
      const errorResponse = handleSubscriptionError(error);
      return NextResponse.json(
        {
          success: false,
          error: errorResponse.message,
          code: errorResponse.code,
          metadata: errorResponse.metadata,
        },
        { status: errorResponse.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Higher-order function to wrap API route handlers with resource limit enforcement
 *
 * Usage:
 * ```ts
 * export const POST = withResourceLimitHandler(
 *   'properties',
 *   async (request: NextRequest, userId: string) => {
 *     // Your handler logic here
 *     // userId is already validated and available
 *     const body = await request.json();
 *     // ...
 *   }
 * );
 * ```
 */
export function withResourceLimitHandler(
  resourceType: ResourceType,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>,
  customErrorMessage?: string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const userId = await getUserIdFromRequest(request);

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
          { status: 401 }
        );
      }

      const limitError = await withResourceLimit(
        userId,
        resourceType,
        customErrorMessage
      );

      if (limitError) {
        return limitError;
      }

      return await handler(request, userId);
    } catch (error) {
      if (error instanceof Error && isSubscriptionError(error)) {
        const errorResponse = handleSubscriptionError(error);
        return NextResponse.json(
          {
            success: false,
            error: errorResponse.message,
            code: errorResponse.code,
            metadata: errorResponse.metadata,
          },
          { status: errorResponse.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Extract user ID from request
 * This should be customized based on your auth implementation
 */
async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  try {
    const { auth } = await import('@/auth');
    const session = await auth();
    return session?.user?.id || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check resource limit without throwing (for soft limits/warnings)
 *
 * Usage:
 * ```ts
 * const limitCheck = await checkResourceLimitMiddleware(userId, 'properties');
 * if (!limitCheck.allowed) {
 *   // Show warning or handle as needed
 * }
 * ```
 */
export async function checkResourceLimitMiddleware(
  userId: string,
  resourceType: ResourceType
) {
  const { checkResourceLimit } = await import('../services/limits.service');
  return await checkResourceLimit(userId, resourceType);
}

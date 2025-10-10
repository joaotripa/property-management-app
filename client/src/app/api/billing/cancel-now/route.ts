import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cancelSubscriptionNow } from '@/lib/stripe/server';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await cancelSubscriptionNow(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

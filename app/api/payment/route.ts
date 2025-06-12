// app/api/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOrder, verifyPaymentSignature } from '@/lib/razorpay';
import { rateLimit } from '@/lib/rate-limit';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  // 1) Rate limit
  const tooMany = await rateLimit('payment', request);
  if (tooMany) return tooMany;

  // 2) Authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3) Validate body
  const { plan } = await request.json();
  if (!plan) {
    return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
  }

  // 4) Create order
  try {
    const order = await createOrder(plan);
    return NextResponse.json(order);
  } catch (err) {
    console.error('Error creating payment:', err);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // 1) Rate limit
  const tooMany = await rateLimit('payment', request);
  if (tooMany) return tooMany;

  // 2) Authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3) Validate body
  const { orderId, paymentId, signature } = await request.json();
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // 4) Verify payment
  try {
    const valid = await verifyPaymentSignature(orderId, paymentId, signature);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
    // TODO: update subscription status in your DB here
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error verifying payment:', err);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

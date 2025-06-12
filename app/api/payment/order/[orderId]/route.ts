import { NextRequest, NextResponse } from 'next/server';
import { getOrderDetails } from '@/lib/razorpay';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit('order', request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const orderDetails = await getOrderDetails(params.orderId);
    if (!orderDetails) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(orderDetails);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
} 
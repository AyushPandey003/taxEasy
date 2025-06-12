import Razorpay from 'razorpay';
import { kv } from '@vercel/kv';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret:process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
});

// Create a new order
export async function createOrder(amount: number, currency: string = 'INR') {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    // Store order details in KV store
    await kv.set(`order:${order.id}`, {
      amount,
      currency,
      status: 'created',
      createdAt: new Date().toISOString(),
    });

    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
}

// Verify payment signature
export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const crypto = await import('crypto');
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: 'paid' | 'failed',
  paymentId?: string
) {
  const orderData = await kv.get(`order:${orderId}`);
  if (!orderData) {
    throw new Error('Order not found');
  }

  await kv.set(`order:${orderId}`, {
    ...orderData,
    status,
    paymentId,
    updatedAt: new Date().toISOString(),
  });
}

// Get order details
export async function getOrderDetails(orderId: string) {
  return await kv.get(`order:${orderId}`);
}

// Payment plans
export const PAYMENT_PLANS = {
  BASIC: {
    name: 'Basic Plan',
    amount: 999,
    features: ['Basic tax filing', 'Document upload', 'Email support'],
  },
  PROFESSIONAL: {
    name: 'Professional Plan',
    amount: 2499,
    features: ['Advanced tax filing', 'Priority support', 'Tax planning', 'Document storage'],
  },
  ENTERPRISE: {
    name: 'Enterprise Plan',
    amount: 4999,
    features: [
      'Full tax management',
      '24/7 support',
      'Tax planning',
      'Unlimited document storage',
      'API access',
    ],
  },
}; 
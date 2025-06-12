'use client';

import { PAYMENT_PLANS } from '@/lib/razorpay';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { RateLimitError } from '@/components/ui/rate-limit-error';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: {
      new (options: { key: string; amount: number; currency: string; name: string; description: string; order_id: string; handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void; prefill?: { name?: string; email?: string }; theme?: { color?: string } }): { open: () => void };
    };
  }
}

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [rateLimitError, setRateLimitError] = useState<{ retryAfter?: number; message?: string } | null>(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setIsRazorpayLoaded(true);
    }
  }, []);

  const handleSubscribe = async (plan: keyof typeof PAYMENT_PLANS) => {
    if (!isRazorpayLoaded) {
      toast.error('Payment system is not ready. Please try again in a moment.');
      return;
    }

    setIsLoading(prev => ({ ...prev, [plan]: true }));
    setRateLimitError(null);
    
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          setRateLimitError({
            retryAfter: error.retryAfter,
            message: error.message,
          });
          return;
        }
        throw new Error(error.error || 'Failed to create payment');
      }

      const order = await response.json();
      
      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'TaxOp',
        description: PAYMENT_PLANS[plan].name,
        order_id: order.id,
        handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          try {
            const verifyResponse = await fetch('/api/payment', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            toast.success('Payment successful!');
            // Redirect to success page
            window.location.href = `/payment/success?orderId=${order.id}`;
          } catch {
            toast.error('Payment verification failed');
            window.location.href = `/payment/failed?orderId=${order.id}`;
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
        theme: {
          color: '#2563eb',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(prev => ({ ...prev, [plan]: false }));
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setIsRazorpayLoaded(true)}
      />
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose the right plan for you
            </p>
          </div>
          {rateLimitError && (
            <div className="mt-8">
              <RateLimitError {...rateLimitError} />
            </div>
          )}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PAYMENT_PLANS).map(([key, plan]) => (
              <div
                key={key}
                className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10"
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 className="text-lg font-semibold leading-8 text-gray-900">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    Perfect for {key.toLowerCase()} users
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      ₹{plan.amount}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">/year</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <Check className="h-6 w-5 flex-none text-indigo-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => handleSubscribe(key as keyof typeof PAYMENT_PLANS)}
                  disabled={isLoading[key] || !isRazorpayLoaded}
                  className="mt-8 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading[key] ? 'Processing...' : !isRazorpayLoaded ? 'Loading...' : 'Subscribe'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 
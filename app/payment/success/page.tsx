'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderDetails {
  id: string;
  amount: number;
  status: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      setError(null);
      fetch(`/api/payment/order/${orderId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch order details');
          }
          return res.json();
        })
        .then(data => {
          setOrderDetails(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(err.message || 'An error occurred while fetching order details.');
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError("Order ID not found in query parameters.");
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="mt-6 border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-red-500">Error: {error}</p>
      </div>
    );
  }
  
  if (!orderDetails && !orderId) {
    return (
      <div className="mt-6 border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-500">No order details to display.</p>
      </div>
    );
  }


  return (
    <>
      {orderDetails && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Order ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {orderDetails.id}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                ₹{orderDetails.amount / 100}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {orderDetails.status}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Payment Successful!</h3>
              <p className="mt-1 text-sm text-gray-500">
                Thank you for your subscription. Your payment has been processed successfully.
              </p>
            </div>

            <Suspense fallback={<div className="mt-6 border-t border-gray-200 pt-6 text-center"><p className="text-sm text-gray-500">Loading order details...</p></div>}>
              <PaymentSuccessContent />
            </Suspense>

            <div className="mt-6 flex justify-center space-x-4">
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline">View Plans</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { AlertCircle } from 'lucide-react';

interface RateLimitErrorProps {
  retryAfter?: number;
  message?: string;
}

export function RateLimitError({ retryAfter, message }: RateLimitErrorProps) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Rate Limit Exceeded</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {message || 'You have made too many requests. Please try again later.'}
            </p>
            {retryAfter && (
              <p className="mt-1">
                Please wait {Math.ceil(retryAfter / 60)} minutes before trying again.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
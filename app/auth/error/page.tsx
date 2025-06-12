"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MainLayout from "../../components/shared/main-layout";
import { AlertTriangle } from "lucide-react";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  "OAuthSignin": "Error occurred during the OAuth sign-in process. This could be due to missing or invalid credentials.",
  "OAuthCallback": "Error occurred during the OAuth callback.",
  "OAuthCreateAccount": "Could not create OAuth provider account.",
  "EmailCreateAccount": "Could not create email provider account.",
  "Callback": "Error occurred during the callback handling.",
  "OAuthAccountNotLinked": "Email already exists with a different provider.",
  "EmailSignin": "Check your email for a sign-in link.",
  "CredentialsSignin": "The credentials you provided are invalid.",
  "SessionRequired": "You must be signed in to access this page.",
  "Default": "An error occurred during authentication."
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
          <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {errorMessage}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            Error code: {error}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            href="/auth/signin"
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Sign In
          </Link>
          
          <Link
            href="/"
            className="flex w-full justify-center rounded-md border border-slate-300 dark:border-slate-700 py-3 px-4 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <ErrorContent />
      </Suspense>
    </MainLayout>
  );
} 
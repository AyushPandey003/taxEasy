import MainLayout from "../components/shared/main-layout";
import FilingSteps from "../components/tax/filing-steps";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";

export const metadata = {
  title: "Tax Filing Guide - TaxOp",
  description: "Step-by-step guide for filing income tax returns in India based on your tax profile",
};

export default function FilingGuidePage() {
  return (
    <MainLayout>
      <div className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      </div>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Income Tax Filing Guide
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
            Follow our step-by-step guide tailored to your specific situation. We&#39;ll help you navigate the tax filing process with clear instructions, document checklists, and deadline reminders.
          </p>
        </div>
        
        {/* Important Dates Card */}
        <div className="mb-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <CalendarCheck className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Important FY 2024-25 Tax Deadlines
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="bg-white dark:bg-slate-800 rounded-md p-4 shadow-sm">
                  <p className="text-blue-600 dark:text-blue-400 font-medium">July 31, 2024</p>
                  <p className="text-slate-700 dark:text-slate-300">Deadline to file ITR for individuals without audit requirements</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-md p-4 shadow-sm">
                  <p className="text-blue-600 dark:text-blue-400 font-medium">September 30, 2024</p>
                  <p className="text-slate-700 dark:text-slate-300">Deadline for tax audit completion</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-md p-4 shadow-sm">
                  <p className="text-blue-600 dark:text-blue-400 font-medium">October 31, 2024</p>
                  <p className="text-slate-700 dark:text-slate-300">Deadline to file ITR for audit cases</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-md p-4 shadow-sm">
                  <p className="text-blue-600 dark:text-blue-400 font-medium">March 31, 2025</p>
                  <p className="text-slate-700 dark:text-slate-300">Last date to file belated or revised returns</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-md p-4 shadow-sm">
                  <p className="text-blue-600 dark:text-blue-400 font-medium">Quarterly Dates</p>
                  <p className="text-slate-700 dark:text-slate-300">Advance tax due: June 15, Sep 15, Dec 15, Mar 15</p>
                </div>
              </div>
            </div>
          </div>
        <div>
        </div>
        
        {/* Filing Steps Component */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
            Your Personalized Filing Steps
          </h2>
          <FilingSteps />
        </div>
        
        {/* Additional Resources */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Additional Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/tax-laws" 
              className="block p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <h3 className="font-medium text-slate-900 dark:text-white mb-1">Tax Law Explainer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Understand tax laws relevant to your situation
              </p>
            </Link>
            
            <Link 
              href="/calculator" 
              className="block p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <h3 className="font-medium text-slate-900 dark:text-white mb-1">Tax Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate your tax liability before filing
              </p>
            </Link>
            
            <a 
              href="https://www.incometax.gov.in/iec/foportal/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <h3 className="font-medium text-slate-900 dark:text-white mb-1">Official Income Tax Portal</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Visit the official portal to file your returns
              </p>
            </a>
            
            <Link 
              href="/community" 
              className="block p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <h3 className="font-medium text-slate-900 dark:text-white mb-1">Community Forum</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ask questions and get help with your specific tax queries
              </p>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Disclaimer: This guide is for informational purposes only and should not be considered as professional tax advice. Please consult with a tax professional for advice specific to your situation.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 
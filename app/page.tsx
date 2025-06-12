import Image from "next/image";
import Link from "next/link";
import MainLayout from "./components/shared/main-layout";
import { ArrowRight, Calculator, Book, FileText, Bell, Users } from "lucide-react";

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Simplify Tax Compliance for Indian Taxpayers
              </h1>
              <p className="text-xl mb-8">
                Navigate complex tax laws with confidence using our AI-powered platform designed specifically for Indian taxpayers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/calculator" 
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  Try Tax Calculator
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  href="/tax-laws" 
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400 transition-colors flex items-center justify-center"
                >
                  Explore Tax Laws
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <Image 
                src="/illustration.svg" 
                alt="Tax Planning Illustration" 
                width={600} 
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features for Every Taxpayer
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Whether you&#39;re a salaried professional, freelancer, business owner, or senior citizen, our tools help you navigate the Indian tax landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl">
              <Book className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Tax Law Explainer
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                AI-powered explanations of complex tax laws in simple, jargon-free language with practical examples.
              </p>
              <Link 
                href="/tax-laws" 
                className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center"
              >
                Explore Tax Laws
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl">
              <Calculator className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Personalized Calculator
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Input your income and expenses to get personalized tax-saving recommendations and compare tax regimes.
              </p>
              <Link 
                href="/calculator" 
                className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center"
              >
                Calculate Your Tax
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl">
              <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Tax Filing Guide
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Step-by-step guidance tailored to your specific situation, with document checklists and deadline reminders.
              </p>
              <Link 
                href="/filing-guide" 
                className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center"
              >
                Get Filing Help
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl">
              <Bell className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Policy Updates
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Stay informed with real-time updates on tax policy changes, budget announcements, and compliance deadlines.
              </p>
              <Link 
                href="/updates" 
                className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center"
              >
                View Updates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl">
              <Users className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Community Forum
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Connect with other taxpayers, ask questions, and get AI-assisted answers with human verification.
              </p>
              <Link 
                href="/community" 
                className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center"
              >
                Join Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">हि</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Multilingual Support
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Access tax information in English, Hindi, and other regional Indian languages for better accessibility.
              </p>
              <Link 
                href="/settings" 
                className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center"
              >
                Language Settings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-slate-100 dark:bg-slate-800">
        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Ready to Optimize Your Tax Strategy?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Join thousands of Indian taxpayers who are saving money and staying compliant with TaxOp&#39;s intelligent tools.
          </p>
          <Link 
            href="/auth/register" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg inline-block transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}

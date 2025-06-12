import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 py-10 px-6 md:px-10 w-full border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900">
            TaxOp
          </Link>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Empowering Indian taxpayers with clarity and confidence
          </p>
        </div>
        
        <div className="col-span-1">
          <h3 className="font-medium text-slate-900 dark:text-white mb-3">Resources</h3>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/tax-laws" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
              >
                Tax Laws
              </Link>
            </li>
            <li>
              <Link 
                href="/calculator" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
              >
                Tax Calculator
              </Link>
            </li>
            <li>
              <Link 
                href="/filing-guide" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
              >
                Filing Guide
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h3 className="font-medium text-slate-900 dark:text-white mb-3">Community</h3>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/community" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
              >
                Forum
              </Link>
            </li>
            <li>
              <Link 
                href="/updates" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
              >
                Policy Updates
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h3 className="font-medium text-slate-900 dark:text-white mb-3">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/privacy" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link 
                href="/terms" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-10 pt-5 border-t border-slate-200 dark:border-slate-800">
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} TaxOp. All rights reserved. For informational purposes only.
        </p>
      </div>
    </footer>
  );
} 
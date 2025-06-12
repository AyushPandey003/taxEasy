"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { cn } from "../../lib/utils/util2";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Tax Laws", href: "/tax-laws" },
  { name: "Calculator", href: "/calculator" },
  { name: "Filing Guide", href: "/filing-guide" },
  { name: "Updates", href: "/updates" },
  { name: "Community", href: "/community" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-10 w-full bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="text-xl font-bold text-blue-600 dark:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
        >
          TaxOp
        </Link>
        
        <div className="hidden md:flex space-x-6 ml-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900",
                pathname === link.href
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-slate-700 dark:text-slate-200"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-sm text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm transition-colors text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
} 
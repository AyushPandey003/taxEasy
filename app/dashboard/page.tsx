import {
  CalendarClock,
  Calculator,
  BarChart3,
  PieChart,
  Bell,
  FileCheck,
  TrendingUp,
  ListChecks,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import MainLayout from "../components/shared/main-layout";

// This would typically come from a database or API in a real application
async function getUserTaxData() {
  // This is a placeholder for real data
  return {
    name: "Rajesh Kumar",
    financialYear: "2023-24",
    totalIncome: 1250000,
    taxLiability: {
      oldRegime: 75000,
      newRegime: 65000
    },
    taxSavings: {
      section80C: 45000,
      section80D: 25000,
      section80G: 10000,
      others: 15000
    },
    taxFilingStatus: {
      lastFiled: "July 28, 2023",
      currentStatus: "Not Started",
      dueDate: "July 31, 2024"
    },
    upcomingDeadlines: [
      {
        id: 1,
        title: "Advance Tax (Q1)",
        dueDate: "June 15, 2024",
        status: "Pending"
      },
      {
        id: 2,
        title: "Income Tax Return Filing",
        dueDate: "July 31, 2024",
        status: "Not Started"
      }
    ],
    recentTransactions: [
      {
        id: 1,
        date: "April 10, 2024",
        description: "TDS by Employer (Q4)",
        amount: 35000,
        type: "Credit"
      },
      {
        id: 2,
        date: "March 15, 2024",
        description: "Advance Tax Payment (Q4)",
        amount: 20000,
        type: "Debit"
      }
    ]
  };
}

export default async function DashboardPage() {
  const userData = await getUserTaxData();
  
  // Calculate total savings
  const totalSavings = Object.values(userData.taxSavings).reduce((sum, value) => sum + value, 0);
  
  // Calculate tax regime difference
  const regimeDifference = userData.taxLiability.oldRegime - userData.taxLiability.newRegime;
  const betterRegime = regimeDifference > 0 ? "New" : "Old";
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {userData.name}
              </h1>
              <p className="text-blue-100">
                Financial Year {userData.financialYear} Dashboard
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link 
                href="/calculator" 
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center text-sm"
              >
                Tax Calculator
                <Calculator className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/filing-guide" 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400 transition-colors flex items-center text-sm"
              >
                File Taxes
                <FileCheck className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-8 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tax Liability Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tax Liability</h2>
                <span className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Old Regime</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(userData.taxLiability.oldRegime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">New Regime</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(userData.taxLiability.newRegime)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Recommended</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{betterRegime} Regime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Savings Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tax Savings</h2>
                <span className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Section 80C</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(userData.taxSavings.section80C)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Section 80D</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(userData.taxSavings.section80D)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Savings</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(totalSavings)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filing Status Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filing Status</h2>
                <span className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                  <FileCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Current Status</span>
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 text-xs rounded-full font-medium">
                    {userData.taxFilingStatus.currentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Last Filed</span>
                  <span className="font-medium text-slate-900 dark:text-white">{userData.taxFilingStatus.lastFiled}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Due Date</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{userData.taxFilingStatus.dueDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Total Income</h2>
                <span className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Gross Total</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(userData.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Tax Slab</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {userData.totalIncome <= 700000 ? "Nil" : userData.totalIncome <= 1200000 ? "10-15%" : "20-30%"}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <Link 
                    href="/calculator" 
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium inline-flex items-center"
                  >
                    Detailed Breakdown
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deadlines and Transactions */}
      <section className="py-10 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Deadlines */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Upcoming Deadlines
                </h2>
                <span className="text-blue-600 dark:text-blue-400 flex items-center text-sm">
                  <CalendarClock className="w-4 h-4 mr-1" />
                  Real-time updates
                </span>
              </div>
              
              <div className="space-y-4">
                {userData.upcomingDeadlines.map((deadline) => (
                  <div 
                    key={deadline.id} 
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {deadline.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        deadline.status === "Completed" 
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" 
                          : deadline.status === "In Progress"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400"
                      }`}>
                        {deadline.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Due: {deadline.dueDate}
                      </span>
                      <Link 
                        href={`/filing-guide/${deadline.id}`} 
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium inline-flex items-center"
                      >
                        Take Action
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Link 
                  href="/updates" 
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium inline-flex items-center"
                >
                  View All Deadlines
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Recent Tax Transactions
                </h2>
                <Link 
                  href="/transactions" 
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium inline-flex items-center"
                >
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {userData.recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {transaction.date}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {transaction.description}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${
                          transaction.type === "Credit" 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {transaction.type === "Credit" ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-10 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link 
              href="/calculator" 
              className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-shadow"
            >
              <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm text-slate-900 dark:text-white text-center">Tax Calculator</span>
            </Link>
            
            <Link 
              href="/filing-guide" 
              className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-shadow"
            >
              <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm text-slate-900 dark:text-white text-center">File Return</span>
            </Link>
            
            <Link 
              href="/tax-laws" 
              className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-shadow"
            >
              <ListChecks className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm text-slate-900 dark:text-white text-center">Tax Laws</span>
            </Link>
            
            <Link 
              href="/updates" 
              className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-shadow"
            >
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm text-slate-900 dark:text-white text-center">Updates</span>
            </Link>
            
            <Link 
              href="/settings" 
              className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-shadow"
            >
              <PieChart className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm text-slate-900 dark:text-white text-center">Tax Reports</span>
            </Link>
            
            <Link 
              href="/community" 
              className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-shadow"
            >
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm text-slate-900 dark:text-white text-center">Community</span>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
} 
import MainLayout from "../components/shared/main-layout";
import TaxCalculator from "../components/calculator/tax-calculator";

export const metadata = {
  title: "Tax Calculator - TaxOp",
  description: "Calculate your taxes under both old and new regimes and get personalized recommendations",
};

export default function CalculatorPage() {
  return (
    <MainLayout>
      <div className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Indian Income Tax Calculator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Compare your tax liability under both old and new tax regimes to find the optimal tax strategy.
          </p>
        </div>
        
        <TaxCalculator />
        
        <div className="mt-10 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Important Notes
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              This calculator provides estimates based on the current tax laws for FY 2024-25.
            </li>
            <li>
              The Old Regime allows various deductions and exemptions, but has higher tax rates.
            </li>
            <li>
              The New Regime has lower tax rates but eliminates most deductions except for a few like employer&apos;s NPS contribution.
            </li>
            <li>
              For precise tax calculations and filing assistance, please consult a tax professional or chartered accountant.
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
} 
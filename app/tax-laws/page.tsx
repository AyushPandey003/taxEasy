import MainLayout from "../components/shared/main-layout";
import TaxLawExplainer from "../components/tax/tax-law-explainer";

export const metadata = {
  title: "Tax Law Explainer - TaxOp",
  description: "Get clear, jargon-free explanations of Indian tax laws with AI assistance",
};

export default function TaxLawsPage() {
  return (
    <MainLayout>
      <div className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Indian Tax Law Explainer
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
            Understand complex tax laws and deductions with our AI-powered explainer. Get clear, jargon-free explanations with examples relevant to your situation.
          </p>
        </div>
        
        <TaxLawExplainer />
        
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            How This Works
          </h2>
          <ol className="list-decimal pl-5 space-y-3 text-slate-700 dark:text-slate-300">
            <li>
              <span className="font-medium">Enter a tax section</span> - Type the section number (e.g., &quot;80C&quot;) or select from common sections.
            </li>
            <li>
              <span className="font-medium">Choose financial year</span> - Select the relevant financial year for your query.
            </li>
            <li>
              <span className="font-medium">Get explanation</span> - Our AI will explain the tax law in simple language with examples.
            </li>
            <li>
              <span className="font-medium">Save and refer</span> - Sign in to save your searches and access them later.
            </li>
          </ol>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Note: While our AI provides accurate explanations, we recommend consulting with a tax professional for personalized advice specific to your situation.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 
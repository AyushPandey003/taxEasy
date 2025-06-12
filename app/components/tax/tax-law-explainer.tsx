"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getTaxLawExplanation } from '../../../actions/gemini';

// Common tax law sections for quick selection
const commonSections = [
  { id: '80C', name: 'Section 80C - Investments & Expenses' },
  { id: '80D', name: 'Section 80D - Health Insurance' },
  { id: '80G', name: 'Section 80G - Donations' },
  { id: '80TTA', name: 'Section 80TTA - Interest on Savings' },
  { id: '80E', name: 'Section 80E - Education Loan' },
  { id: '24B', name: 'Section 24(b) - Housing Loan Interest' },
];

// Financial years for selection
const financialYears = [
  '2024-25',
  '2023-24',
  '2022-23',
];

export default function TaxLawExplainer() {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [section, setSection] = useState('');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [explanation, setExplanation] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const fetchExplanation = async () => {
    if (!section) {
      setError('Please enter a tax section');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the server action directly
      const response = await getTaxLawExplanation({
        section,
        financialYear,
      });

      let result: { text: string; error?: string };

      if (response instanceof Response) {
        const text = await response.text();
        result = { text };
      } else {
        result = response;
      }

      if ('error' in result && result.error) {
        throw new Error(result.error);
      }

      setExplanation(result.text);
      
      // Add to search history if not already present
      if (!searchHistory.includes(section)) {
        setSearchHistory(prev => [section, ...prev].slice(0, 5));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred');
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error fetching tax law explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Search Panel */}
      <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md space-y-6">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            Tax Law Lookup
          </h3>
          
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="section" 
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Tax Section
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g., 80C, 80D"
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label 
                htmlFor="financialYear" 
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Financial Year
              </label>
              <select
                id="financialYear"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
              >
                {financialYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={fetchExplanation}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Explain Tax Section
                </>
              )}
            </button>
            
            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            Common Tax Sections
          </h3>
          <div className="space-y-2">
            {commonSections.map((taxSection) => (
              <button
                key={taxSection.id}
                onClick={() => setSection(taxSection.id)}
                className="w-full text-left px-3 py-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md text-sm text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {taxSection.name}
              </button>
            ))}
          </div>
        </div>
        
        {searchHistory.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item) => (
                <button
                  key={item}
                  onClick={() => setSection(item)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md text-sm text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Explanation Panel */}
      <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Generating explanation...
            </p>
          </div>
        ) : explanation ? (
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
              {section} Explanation (FY {financialYear})
            </h2>
            <div className="markdown-content">
              <ReactMarkdown>
                {explanation}
              </ReactMarkdown>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
              Note: This explanation is generated by AI and should be verified against official sources.
              {status !== "authenticated" && (
                <p className="mt-2">
                  <a href="/auth/signin" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Sign in
                  </a>{" "}
                  to save your searches and get personalized tax advice.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <FileText className="h-16 w-16 text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">
              Tax Law Explainer
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              Select a tax section and financial year to get a simple, jargon-free explanation with examples.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
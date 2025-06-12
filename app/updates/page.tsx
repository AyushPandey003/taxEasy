import { Suspense } from 'react';
import { fetchTaxDeadlines, fetchTaxUpdates, fetchTaxLaws, getTaxDeadlinesFallback, getTaxUpdatesFallback, getTaxLawsFallback } from '../lib/scraper';
import MainLayout from "../components/shared/main-layout";

// Deadlines Component
async function TaxDeadlines() {
  const deadlines = await fetchTaxDeadlines().catch(async () => await getTaxDeadlinesFallback());
  
  return (
    <div className="bg-slate-50 dark:bg-slate-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Upcoming Tax Deadlines</h2>
      <div className="space-y-4">
        {deadlines.map((deadline, index) => (
          <div key={index} className="border-b dark:border-slate-700 pb-4 last:border-0">
            <div className="flex justify-between">
              <h3 className="font-medium text-lg text-slate-900 dark:text-slate-100">{deadline.title}</h3>
              <span className="text-red-600 dark:text-red-400 font-semibold">{deadline.dueDate}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">{deadline.description}</p>
            <span className="inline-block mt-2 px-2 py-1 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {deadline.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Updates Component
async function TaxUpdates() {
  const updates = await fetchTaxUpdates().catch(async () => await getTaxUpdatesFallback());
  
  // Process updates to ensure valid dates
  const processedUpdates = updates.map(update => {
    // If date is invalid or missing, use a placeholder or current date
    let displayDate = update.date;
    if (displayDate === 'Invalid Date' || !displayDate) {
      displayDate = 'Recently Published';
    }
    return {
      ...update,
      displayDate
    };
  });
  
  return (
    <div className="bg-slate-50 dark:bg-slate-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Latest Indian Tax Updates</h2>
      <div className="space-y-4">
        {processedUpdates.map((update, index) => (
          <div key={index} className="border-b dark:border-slate-700 pb-4 last:border-0">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-lg text-slate-900 dark:text-slate-100">{update.title}</h3>
              <span className="text-sm text-gray-700 dark:text-slate-300">{update.displayDate}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">{update.summary}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-slate-300">Source: {update.source}</span>
              {update.url && (
                <a 
                  href={update.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                >
                  Read more
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-2 border-t dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Indian tax updates powered by <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">News API</a>
        </p>
      </div>
    </div>
  );
}

// Tax Laws Component
async function TaxLaws() {
  const laws = await fetchTaxLaws().catch(async () => await getTaxLawsFallback());
  
  return (
    <div className="bg-slate-50 dark:bg-slate-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Recent Tax Law Changes</h2>
      <div className="space-y-4">
        {laws.map((law, index) => (
          <div key={index} className="border-b dark:border-slate-700 pb-4 last:border-0">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-lg text-slate-900 dark:text-slate-100">{law.title}</h3>
              <span className="text-sm text-gray-700 dark:text-slate-300">Effective: {law.effectiveDate}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">{law.summary}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="inline-block px-2 py-1 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                {law.category}
              </span>
              {law.url && (
                <a 
                  href={law.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                >
                  View full document
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Components
function LoadingDeadlines() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 shadow rounded-lg p-6 animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2 pb-4 mb-4 border-b dark:border-slate-700 last:border-0">
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

function LoadingUpdates() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 shadow rounded-lg p-6 animate-pulse">
      <div className="h-7 bg-gray-300 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2 pb-4 mb-4 border-b dark:border-slate-700 last:border-0">
          <div className="h-5 bg-gray-300 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-3 bg-gray-300 dark:bg-slate-700 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

export default function UpdatesPage() {
  return (
    <MainLayout>
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-8">Indian Tax Updates & Deadlines</h1>
        <p className="text-gray-700 dark:text-slate-300 mb-8">
          Stay informed about the latest Indian tax changes, deadlines, and regulatory updates from official government sources and leading financial news outlets.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Suspense fallback={<LoadingDeadlines />}>
            <TaxDeadlines />
          </Suspense>
          
          <Suspense fallback={<LoadingUpdates />}>
            <TaxUpdates />
          </Suspense>
        </div>
        
        <div className="mb-8">
          <Suspense fallback={<LoadingUpdates />}>
            <TaxLaws />
          </Suspense>
        </div>
        
        <div className="bg-blue-100 dark:bg-slate-800 p-4 rounded-lg border border-blue-300 dark:border-slate-700">
          <h3 className="font-medium text-blue-800 dark:text-slate-100 mb-2">Data Sources</h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            The information on this page is sourced from the Income Tax Department of India, GST Portal,
            News API, and other official government websites. Tax updates are fetched from reliable news 
            sources and are updated regularly to provide the most accurate information.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 
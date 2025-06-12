import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Tag, MessageSquare, ThumbsUp, Eye, Check } from "lucide-react";
import MainLayout from "../../components/shared/main-layout";
import SearchBar from "../components/search-bar";

type SearchParams = {
  q?: string;
  tag?: string;
};

export const metadata: Metadata = {
  title: "Search Results | TaxOp Community",
  description: "Search for tax-related questions and answers in the TaxOp community",
};

async function getSearchResults(query?: string, tag?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    let url = `${baseUrl}/api/community?type=questions`;

    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }
    
    if (tag) {
      url += `&tag=${encodeURIComponent(tag)}`;
    }
    
    const res = await fetch(url, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch search results');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error searching questions:', error);
    return [];
  }
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q: query, tag } = searchParams;
  const searchTerm = query || tag || '';
  
  // Fetch search results
  const results = await getSearchResults(query, tag);
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href="/community" 
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Community
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {tag 
              ? <span>Questions tagged with <span className="text-blue-600 dark:text-blue-400">&quot;{tag}&quot;</span></span>
              : query 
                ? <span>Search results for <span className="text-blue-600 dark:text-blue-400">&quot;{query}&quot;</span></span>
                : "Browse All Questions"}
          </h1>
          
          <SearchBar defaultValue={searchTerm} />
        </div>
        
        {/* Search Results */}
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map((question: { id: string; title: string; body: string; tags: string[]; createdAt: string; answerCount: number; hasAcceptedAnswer: boolean; likes: number; views: number; }) => (
              <div key={question.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                <Link 
                  href={`/community/questions/${question.id}`}
                  className="text-lg font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block mb-2"
                >
                  {question.title}
                </Link>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                  {question.body.replace(/<[^>]*>?/gm, '').substring(0, 160)}...
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags?.map((tag: string, index: number) => (
                    <Link 
                      key={index}
                      href={`/community/search?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Link>
                  ))}
                </div>
                
                <div className="flex flex-wrap items-center justify-between">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {question.createdAt}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {question.answerCount} answers
                      {question.hasAcceptedAnswer && (
                        <Check className="w-3 h-3 ml-1 text-green-500" />
                      )}
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {question.likes} likes
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {question.views} views
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {searchTerm 
                  ? `No questions found matching "${searchTerm}". Try a different search term.`
                  : "No questions found."}
              </p>
              <Link 
                href="/community/ask" 
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Ask a New Question
              </Link>
            </div>
          )}
        </div>
        
        {/* Ask Question Button (if there are results) */}
        {results.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link 
              href="/community/ask" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-block"
            >
              Ask a New Question
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
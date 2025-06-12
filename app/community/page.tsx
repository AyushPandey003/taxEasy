import { Search, MessageSquare, ThumbsUp, Eye, MessageCircle, ArrowRight, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import MainLayout from "../components/shared/main-layout";
type Author = {
  id?: number;
  name: string;
  avatar: string;
  verified: boolean;
};

type Answer = {
  id: number;
  body: string;
  authorId: number;
  createdAt: string;
  likes: number;
  isAccepted: boolean;
};

type Question = {
  id: number;
  title: string;
  content: string;
  author: Author;
  tags: string[];
  createdAt: string;
  views: number;
  likes: number;
  answers: Answer[];
};

type Tag = {
  id: number;
  name: string;
  count: number;
};

type Contributor = {
  id: number;
  name: string;
  answers: number;
  avatar: string;
  isTaxPro: boolean;
  designation?: string;
  questions?: number;
  points?: number;
  specializations?: string[];
};
async function getCommunityQuestions(filter = 'recent'): Promise<Question[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Fallback needed
    const res = await fetch(`${baseUrl}/api/community?type=posts&filter=${filter}`, {
      cache: 'no-store' // Don't cache to get fresh data each time
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
  
      return getFallbackQuestions();
    }
    
    // Parse the response
    const data = await res.json();
    
    // If the response is empty or not an array, use fallback data
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No questions returned from API, using fallback data');
      return getFallbackQuestions();
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    // Fallback data in case of error
    return getFallbackQuestions();
  }
}

// Helper function to provide fallback question data
function getFallbackQuestions(): Question[] {
  return [
    {
      id: 1,
      title: "Confusion about section 80C tax benefits for fixed deposits",
      content: "I have a tax-saving fixed deposit that matures in April 2024. Can I still claim the deduction under 80C for FY 2023-24?",
      author: {
        name: "Rahul Sharma",
        avatar: "/avatars/user1.png",
        verified: true
      },
      tags: ["80C", "Tax Saving", "Fixed Deposit"],
      createdAt: "2/4/2023",
      views: 132,
      likes: 24,
      answers: []
    },
    {
      id: 2,
      title: "Do I need to pay tax on cryptocurrency gains in India?",
      content: "I've been trading Bitcoin and Ethereum this year. How are crypto gains taxed in India?",
      author: {
        name: "Priya Patel",
        avatar: "/avatars/user2.png",
        verified: false
      },
      tags: ["Cryptocurrency", "Capital Gains"],
      createdAt:"2/4/2023",
      views: 287,
      likes: 42,
      answers: []
    }
  ];
}

// Fetch tags from API with server-side caching
async function getPopularTags(): Promise<Tag[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Fallback needed
    const res = await fetch(`${baseUrl}/api/community?type=tags`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch tags');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching tags:', error);
    // Fallback data in case of error
    return [
      { id: 1, name: "ITR Filing", count: 143 },
      { id: 2, name: "Tax Saving", count: 128 },
      { id: 3, name: "80C", count: 112 },
      { id: 4, name: "Capital Gains", count: 97 },
      { id: 5, name: "HRA", count: 85 },
      { id: 6, name: "GST", count: 76 },
      { id: 7, name: "TDS", count: 64 },
      { id: 8, name: "NRI Taxation", count: 52 }
    ];
  }
}

// Fetch top contributors from API with server-side caching
async function getTopContributors(): Promise<Contributor[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Fallback needed
    const res = await fetch(`${baseUrl}/api/community?type=users`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await res.json();
    // Sort by answers count and take top 5
    return users.sort((a: Contributor, b: Contributor) => b.answers - a.answers).slice(0, 5);
  } catch (error) {
    console.error('Error fetching contributors:', error);
    // Fallback data in case of error
    return [
      { id: 1, name: "Sudhir Mehta", answers: 87, avatar: "/avatars/expert1.png", isTaxPro: true },
      { id: 2, name: "Priya Desai", answers: 75, avatar: "/avatars/expert2.png", isTaxPro: true },
      { id: 3, name: "Rahul Verma", answers: 62, avatar: "/avatars/expert3.png", isTaxPro: false },
      { id: 4, name: "Anjali Singh", answers: 58, avatar: "/avatars/expert4.png", isTaxPro: false },
      { id: 5, name: "Rohan Kapoor", answers: 43, avatar: "/avatars/expert5.png", isTaxPro: true }
    ];
  }
}

export default async function CommunityPage({
  searchParams
}: {
  searchParams: { filter?: string }
}) {
  // Ensure searchParams is properly awaited
  const filter = (await Promise.resolve(searchParams))?.filter ?? 'recent';
  console.log("Current filter:", filter);

  const questions = await getCommunityQuestions(filter);
  const popularTags = await getPopularTags();
  const topContributors = await getTopContributors();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Tax Community Forum
              </h1>
              <p className="text-xl mb-6">
                Connect with fellow taxpayers and tax experts to get answers to your tax-related questions
              </p>
              <form action="/community/search" method="GET" className="flex items-center bg-white rounded-lg overflow-hidden">
                <input
                  type="text"
                  name="q"
                  placeholder="Search the community..."
                  className="flex-grow px-4 py-3 text-slate-900 focus:outline-none"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-center mb-4">
                  <span className="block text-lg font-medium mb-1">Community Stats</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">12K+</div>
                    <div className="text-sm text-blue-100">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">5K+</div>
                    <div className="text-sm text-blue-100">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">15K+</div>
                    <div className="text-sm text-blue-100">Answers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24 space-y-8">
                {/* Ask Question Button */}
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6 text-center">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Have a tax question?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Get answers from our community of tax experts and fellow taxpayers
                  </p>
                  <Link 
                    href="/community/ask" 
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-block transition-colors"
                  >
                    Ask a Question
                  </Link>
                </div>
                
                {/* Popular Tags */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag: Tag) => (
                      <Link 
                        key={tag.id}
                        href={`/community/search?tag=${encodeURIComponent(tag.name.toLowerCase())}`}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {tag.name}
                        <span className="ml-1 text-slate-500 dark:text-slate-400 text-xs">({tag.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Top Contributors */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Top Contributors
                  </h3>
                  <div className="space-y-4">
                    {topContributors.map((contributor: Contributor) => (
                      <div key={contributor.id} className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden mr-3">
                          <User className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {contributor.name}
                            </span>
                            {contributor.isTaxPro && (
                              <span className="ml-2 flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Tax Pro
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {contributor.answers} answers
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Link 
                      href="/community/contributors" 
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium inline-flex items-center"
                    >
                      View All Contributors
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Questions List */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {filter === 'recent' && 'Recent Questions'}
                  {filter === 'popular' && 'Popular Questions'}
                  {filter === 'unanswered' && 'Unanswered Questions'}
                </h2>
                <div className="flex items-center">
                  <div className="ml-4 flex border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                    <Link 
                      href="/community?filter=recent"
                      className={`px-3 py-1 text-sm ${
                        filter === 'recent' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Recent
                    </Link>
                    <Link 
                      href="/community?filter=popular"
                      className={`px-3 py-1 text-sm ${
                        filter === 'popular' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Popular
                    </Link>
                    <Link 
                      href="/community?filter=unanswered"
                      className={`px-3 py-1 text-sm ${
                        filter === 'unanswered' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Unanswered
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {questions.length > 0 ? (
                  questions.map((question: Question) => (
                    <div 
                      key={question.id} 
                      className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between">
                        <div className="flex items-start">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden mr-3">
                            <User className="h-6 w-6 text-slate-400" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-slate-900 dark:text-white">
                                {question.author.name}
                              </span>
                              {question.author.verified && (
                                <span className="ml-2 text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="h-4 w-4" />
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              Posted {new Date(question.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 text-slate-500 dark:text-slate-400 text-sm">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {question.views}
                          </span>
                          <span className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {question.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {question.answers?.length || 0}
                          </span>
                        </div>
                      </div>
                      
                      <Link href={`/community/questions/${question.id}`} className="mt-4 block">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {question.title}
                        </h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                          {question.content.length > 200 ? `${question.content.substring(0, 200)}...` : question.content}
                        </p>
                      </Link>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {question.tags.map((tag: string, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Link 
                          href={`/community/questions/${question.id}`}
                          className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center"
                        >
                          View Discussion
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                        <Link 
                          href={`/community/questions/${question.id}#answer`}
                          className="text-blue-600 dark:text-blue-400 inline-flex items-center"
                        >
                          <MessageCircle className="mr-1 h-4 w-4" />
                          Answer
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      No questions found. Be the first to ask a question!
                    </p>
                    <Link 
                      href="/community/ask" 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      Ask a Question
                    </Link>
                  </div>
                )}
              </div>
              
              {questions.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-600">
                      Previous
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white">
                      1
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                      2
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                      3
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-blue-50 dark:bg-blue-900/20">
        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Need Expert Tax Advice?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Connect with certified tax professionals who can provide personalized guidance for your specific tax situation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/connect/tax-pro" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Connect with a Tax Pro
            </Link>
            <Link 
              href="/community/ask" 
              className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium border border-slate-300 dark:border-slate-700 transition-colors"
            >
              Ask the Community
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

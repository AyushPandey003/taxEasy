import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, CheckCircle, MessageSquare, HelpCircle, Trophy } from "lucide-react";
import MainLayout from "../../components/shared/main-layout";
interface Contributor {
  id: string;
  name: string | null;
  avatar: string | null;
  isVerified: boolean;
  isTaxPro: boolean;
  designation: string | null;
  specializations: string[];
  questions: number;
  answers: number;
  points: number;
}
export const metadata: Metadata = {
  title: "Top Contributors | TaxOp Community",
  description: "Meet our top tax experts and community contributors",
};

async function getTopContributors() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/community?type=users`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch contributors');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

export default async function ContributorsPage() {
  const contributors = await getTopContributors();
  
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Top Contributors
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
            Meet our top tax experts and community members who help answer tax-related questions
            and contribute valuable insights to the TaxOp community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributors.map((contributor:Contributor) => (
            <div 
              key={contributor.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col"
            >
              <div className="flex items-start mb-4">
                <div className="relative mr-4">
                  {contributor.avatar ? (
                    <Image 
                      src={contributor.avatar} 
                      alt={contributor.name || "User"}
                      width={56} 
                      height={56}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                    </div>
                  )}
                  {contributor.isVerified && (
                    <span className="absolute -bottom-1 -right-1 block bg-blue-500 rounded-full p-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </span>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {contributor.name || "Anonymous"}
                  </h3>
                  
                  {contributor.isTaxPro && (
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium mb-1">
                      <Trophy className="w-4 h-4 mr-1" />
                      Tax Professional
                    </div>
                  )}
                  
                  {contributor.designation && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {contributor.designation}
                    </p>
                  )}
                </div>
              </div>
              
              {contributor.specializations && contributor.specializations.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Specializations</p>
                  <div className="flex flex-wrap gap-1">
                    {contributor.specializations.map((spec: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    <span>{contributor.questions || 0} questions</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    <span>{contributor.answers || 0} answers</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {contributor.points} points
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {contributors.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No contributors found at the moment.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
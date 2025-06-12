import Link from 'next/link';
import { MessageSquare, Eye } from 'lucide-react';

interface RelatedQuestionsProps {
  currentQuestionId: string;
  tags: string[];
}

interface Question {
  id: string;
  title: string;
  comments: number;
  upvotes: number;
}

async function getRelatedQuestions(currentId: string, tags: string[]): Promise<Question[]> {
  try {
    const tagQuery = tags && tags.length > 0
      ? `&tag=${encodeURIComponent(tags[0])}`
      : '';
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/community?type=posts${tagQuery}`, { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch related questions');
    }
    
    const questions: Question[] = await res.json();
    
    // Filter out the current question and limit to 5
    return questions
      .filter((q: Question) => q.id !== currentId)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching related questions:', error);
    return [];
  }
}

export default async function RelatedQuestions({ currentQuestionId, tags }: RelatedQuestionsProps) {
  const relatedQuestions = await getRelatedQuestions(currentQuestionId, tags);
  
  if (relatedQuestions.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Related Questions</h3>
      <div className="space-y-4">
        {relatedQuestions.map((question: Question) => (
          <div key={question.id} className="border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
            <Link 
              href={`/community/questions/${question.id}`}
              className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 mb-1"
            >
              {question.title}
            </Link>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center">
                <MessageSquare className="w-3 h-3 mr-1" />
                {question.comments}
              </span>
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {question.upvotes}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <Link 
          href="/community/ask" 
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Ask a New Question
        </Link>
      </div>
    </div>
  );
} 
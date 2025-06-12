'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

interface AnswerFormProps {
  questionId: string;
}

export default function AnswerForm({ questionId }: AnswerFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('Please sign in to submit an answer');
      return;
    }
    
    if (!body.trim()) {
      setError('Answer cannot be empty');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'comment',
          postId: questionId,
          content: body.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      setBody('');
      // Refresh the page to show the new answer
      router.refresh();
      
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      {!session && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm rounded-lg">
          Please <a href="/auth/signin" className="font-medium underline">sign in</a> to post an answer.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your answer here..."
            rows={6}
            disabled={!session || isSubmitting}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
          {error && <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>}
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Guidelines: Be respectful and helpful. Provide accurate information with sources when possible.
          </p>
          <button
            type="submit"
            disabled={!session || isSubmitting || !body.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:cursor-not-allowed"
          >
            <span>Post Answer</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
} 
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Tag as TagIcon, Plus, X, Loader2 } from 'lucide-react';
import MainLayout from '../../components/shared/main-layout';

export default function AskQuestionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  const loading = status === 'loading';

  // Handle tag addition
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) {
      setTagInput('');
      return;
    }
    if (tags.length >= 5) {
      setError('You can add a maximum of 5 tags');
      return;
    }
    
    setTags([...tags, trimmedTag]);
    setTagInput('');
    tagInputRef.current?.focus();
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle tag input keydown (for Enter key)
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Handle form submission
// src/app/community/ask/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!session) {
    setError('Please sign in to ask a question');
    return;
  }

  if (title.trim().length < 10) {
    setError('Title should be at least 10 characters long');
    return;
  }

  if (body.trim().length < 20) {
    setError('Question details should be at least 20 characters long');
    return;
  }

  setError('');
  setIsSubmitting(true);

  try {
    const response = await fetch('/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'post',
        title: title.trim(),
        content: body.trim(),
        tags: tags.length > 0 ? tags : undefined,
      }),
    });

    if (!response.ok) {
      console.log('Response Status:', response.status);
      console.log('Response Headers:', [...response.headers.entries()]);
      const contentType = response.headers.get('Content-Type');
      const responseText = await response.text();
      console.log('Response Body:', responseText);

      if (contentType?.includes('application/json') && responseText) {
        try {
          const errorData = JSON.parse(responseText);
          setError(errorData.error || 'Something went wrong. Please try again.');
        } catch (jsonError) {
          console.error('JSON Parse Error:', jsonError);
          setError('Server returned invalid JSON. Please try again.');
        }
      } else {
        setError(`Server error (${response.status}): ${responseText || 'No details provided'}`);
      }
      setIsSubmitting(false);
      return;
    }

    const data = await response.json();
    console.log('Question submitted:', data);
    router.push(`/community/questions/${data.id}`);
  } catch (error) {
    console.error('Error submitting question:', error);
    setError('Something went wrong. Please try again.');
    setIsSubmitting(false);
  }
};

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-8">
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
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <HelpCircle className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
            Ask a Question
          </h1>
          
          {!session && !loading && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg">
              <p>Please <Link href="/auth/signin" className="font-medium underline">sign in</Link> to ask a question</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Question Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., How do I claim tax benefits under section 80C?"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
                  disabled={!session || isSubmitting}
                  required
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Be specific and imagine you&apos;re asking a question to another person
                </p>
              </div>
              
              <div>
                <label htmlFor="body" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Question Details
                </label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Explain your question in detail. Include all relevant information."
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
                  disabled={!session || isSubmitting}
                  required
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Include all the information someone would need to answer your question
                </p>
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    id="tags"
                    type="text"
                    ref={tagInputRef}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="e.g., income-tax, 80c, deductions"
                    className="flex-grow px-4 py-3 rounded-l-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
                    disabled={!session || isSubmitting || tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!session || isSubmitting || !tagInput.trim() || tags.length >= 5}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Add up to 5 tags to help categorize your question
                </p>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!session || isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Post Your Question</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

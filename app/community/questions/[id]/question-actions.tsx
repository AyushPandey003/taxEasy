'use client';

import { useState } from 'react';
import { ThumbsUp, Share2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface QuestionActionsProps {
  questionId: string;
  likes: number;
}

export default function QuestionActions({ questionId, likes }: QuestionActionsProps) {
  const { data: session } = useSession();
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!session) {
      toast.error('Please sign in to like questions');
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'like',
          targetId: questionId,
          targetType: 'post',
        }),
      });

      if (response.ok) {
        setLikeCount(prev => prev + 1);
        toast.success('Question liked!');
      } else {
        throw new Error('Failed to like question');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-wrap justify-between items-center py-3 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex space-x-6">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          <span>{likeCount} Like{likeCount !== 1 ? 's' : ''}</span>
        </button>
      </div>
      
      <button
        onClick={handleShare}
        className="flex items-center text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
      >
        <Share2 className="w-4 h-4 mr-2" />
        <span>Share</span>
      </button>
    </div>
  );
} 
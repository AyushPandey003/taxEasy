'use client';

import { useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ClientHandlers({ questionId }: { questionId: string }) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLikeAnswer = useCallback(
    async (e: Event) => {
      if (!session) {
        toast.error('Please sign in to like answers');
        return;
      }

      const button = e.currentTarget as HTMLButtonElement;
      const answerId = button.getAttribute('data-answer-id');
      if (!answerId) return;

      try {
        const res = await fetch('/api/community', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'like',
            targetId: answerId,
            targetType: 'answer',
          }),
        });

        if (!res.ok) throw new Error('Failed to like answer');

        const countSpan = button.querySelector('span');
        if (countSpan) {
          const currentLikes = parseInt(countSpan.textContent || '0', 10);
          countSpan.textContent = (currentLikes + 1).toString();
        }

        toast.success('Answer liked!');
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong. Please try again.');
      }
    },
    [session]
  );

  const handleAcceptAnswer = useCallback(
    async (e: Event) => {
      if (!session) {
        toast.error('Please sign in to accept answers');
        return;
      }

      const button = e.currentTarget as HTMLButtonElement;
      const answerId = button.getAttribute('data-answer-id');
      const qId = button.getAttribute('data-question-id');

      if (!answerId || !qId) return;

      try {
        const res = await fetch('/api/community', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'accept-comment',
            postId: qId,
            commentId: answerId,
          }),
        });

        if (!res.ok) throw new Error('Failed to accept answer');

        toast.success('Answer accepted!');
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong. Please try again.');
      }
    },
    [session, router]
  );

  useEffect(() => {
    const answerLikeButtons = document.querySelectorAll('[data-action="like"]');
    const acceptButtons = document.querySelectorAll('.js-accept-answer');

    // Show accept buttons if current user is the author
    if (session?.user) {
      fetch(`/api/community?type=post&id=${questionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.author.id === (session.user as { id: string }).id) {
            acceptButtons.forEach(btn => btn.classList.remove('hidden'));
          }
        })
        .catch(err => console.error('Error checking author:', err));
    }

    // Add event listeners
    answerLikeButtons.forEach(btn => btn.addEventListener('click', handleLikeAnswer));
    acceptButtons.forEach(btn => btn.addEventListener('click', handleAcceptAnswer));

    // Cleanup
    return () => {
      answerLikeButtons.forEach(btn => btn.removeEventListener('click', handleLikeAnswer));
      acceptButtons.forEach(btn => btn.removeEventListener('click', handleAcceptAnswer));
    };
  }, [session, questionId, handleLikeAnswer, handleAcceptAnswer]);

  return null;
}

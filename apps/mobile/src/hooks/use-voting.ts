import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessionId } from '@/lib/session';

interface VoteResponse {
  thumbsUp: number;
  thumbsDown: number;
  userVote: 'up' | 'down' | null;
}

export function useVoting(resourceId: string) {
  const queryClient = useQueryClient();

  const submitVote = useMutation({
    mutationFn: async (vote: 'up' | 'down') => {
      const response = await fetch(`/api/resources/${resourceId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': getSessionId(),
        },
        body: JSON.stringify({ vote }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      return response.json() as Promise<VoteResponse>;
    },
    onSuccess: () => {
      // Invalidate resource queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/resources', resourceId] });
    },
  });

  const removeVote = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/resources/${resourceId}/vote`, {
        method: 'DELETE',
        headers: {
          'X-Session-Id': getSessionId(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to remove vote');
      }
      return response.json() as Promise<VoteResponse>;
    },
    onSuccess: () => {
      // Invalidate resource queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/resources', resourceId] });
    },
  });

  const handleVote = (vote: 'up' | 'down', currentUserVote?: 'up' | 'down' | null) => {
    if (currentUserVote === vote) {
      // User clicked the same vote, remove it
      removeVote.mutate();
    } else {
      // User clicked a different vote or no vote exists
      submitVote.mutate(vote);
    }
  };

  return {
    handleVote,
    isSubmitting: submitVote.isPending || removeVote.isPending,
    error: submitVote.error || removeVote.error,
  };
}
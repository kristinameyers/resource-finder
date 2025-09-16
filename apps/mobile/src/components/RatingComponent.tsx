import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./ui/button";
import { useVoting } from "../hooks/use-voting";
import { cn } from "../utils";

interface RatingComponentProps {
  resourceId: string;
  thumbsUp: number;
  thumbsDown: number;
  userVote?: 'up' | 'down' | null;
  className?: string;
}

export default function RatingComponent({ 
  resourceId, 
  thumbsUp, 
  thumbsDown, 
  userVote, 
  className 
}: RatingComponentProps) {
  const { handleVote, isSubmitting } = useVoting(resourceId);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant={userVote === 'up' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('up', userVote)}
          disabled={isSubmitting}
          className={cn(
            "flex items-center gap-1",
            userVote === 'up' && "bg-green-600 hover:bg-green-700"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{thumbsUp}</span>
        </Button>
        
        <Button
          variant={userVote === 'down' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('down', userVote)}
          disabled={isSubmitting}
          className={cn(
            "flex items-center gap-1",
            userVote === 'down' && "bg-red-600 hover:bg-red-700"
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{thumbsDown}</span>
        </Button>
      </div>
      
      <div className="text-sm text-gray-600">
        {thumbsUp + thumbsDown === 0 
          ? "Be the first to rate this resource" 
          : `${thumbsUp + thumbsDown} ${thumbsUp + thumbsDown === 1 ? 'vote' : 'votes'}`
        }
      </div>
    </div>
  );
}
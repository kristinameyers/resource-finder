import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  resourceId: string;
  className?: string;
  showText?: boolean;
}

export default function FavoriteButton({ 
  resourceId, 
  className,
  showText = true 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(resourceId);

  const handleToggle = () => {
    toggleFavorite(resourceId);
  };

  return (
    <Button
      variant={favorite ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-2 transition-colors",
        favorite && "bg-red-500 hover:bg-red-600 text-white",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all", 
          favorite ? "fill-current" : "fill-none"
        )} 
      />
      {showText && (
        <span>
          {favorite ? "Remove from Favorites" : "Add to Favorites"}
        </span>
      )}
    </Button>
  );
}
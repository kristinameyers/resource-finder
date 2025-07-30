import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface SortControlProps {
  value: 'relevance' | 'distance' | 'name';
  onValueChange: (value: 'relevance' | 'distance' | 'name') => void;
  hasLocation?: boolean;
}

export default function SortControl({ value, onValueChange, hasLocation }: SortControlProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">Relevance</SelectItem>
          {hasLocation && (
            <SelectItem value="distance">Distance</SelectItem>
          )}
          <SelectItem value="name">Name (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
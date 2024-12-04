import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationTagsProps {
  locations: string[];
  onRemove: (location: string) => void;
}

export function LocationTags({ locations, onRemove }: LocationTagsProps) {
  if (locations.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {locations.map((location) => (
        <span
          key={location}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-sm"
        >
          {location}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemove(location)}
          >
            <X className="h-3 w-3" />
          </Button>
        </span>
      ))}
    </div>
  );
}
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export type SortOption = {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
};

const sortOptions: SortOption[] = [
  { label: 'Best match', value: '', direction: 'desc' },
  { label: 'Most followers', value: 'followers', direction: 'desc' },
  { label: 'Fewest followers', value: 'followers', direction: 'asc' },
  { label: 'Most recently joined', value: 'joined', direction: 'desc' },
  { label: 'Least recently joined', value: 'joined', direction: 'asc' },
  { label: 'Most repositories', value: 'repositories', direction: 'desc' },
  { label: 'Fewest repositories', value: 'repositories', direction: 'asc' },
];

interface SortOptionsProps {
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
}

export function SortOptions({ currentSort, onSortChange }: SortOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          Sort: {currentSort.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={`${option.value}-${option.direction}`}
            onClick={() => onSortChange(option)}
            className="cursor-pointer"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
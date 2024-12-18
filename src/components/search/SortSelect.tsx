import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SortOption {
  label: string
  value: string
  direction: 'asc' | 'desc'
}

interface SortSelectProps {
  currentSort: SortOption
  onSortChange: (option: SortOption) => void
}

const sortOptions: SortOption[] = [
  { label: 'Best match', value: '', direction: 'desc' },
  { label: 'Most followers', value: 'followers', direction: 'desc' },
  { label: 'Fewest followers', value: 'followers', direction: 'asc' },
  { label: 'Most recently joined', value: 'joined', direction: 'desc' },
  { label: 'Least recently joined', value: 'joined', direction: 'asc' },
  { label: 'Most repositories', value: 'repositories', direction: 'desc' },
  { label: 'Fewest repositories', value: 'repositories', direction: 'asc' },
]

export function SortSelect({ currentSort, onSortChange }: SortSelectProps) {
  return (
    <Select
      value={`${currentSort.value}-${currentSort.direction}`}
      onValueChange={(value) => {
        const [sortValue, direction] = value.split('-')
        const option = sortOptions.find(
          (opt) => opt.value === sortValue && opt.direction === direction
        )
        if (option) {
          onSortChange(option)
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem
            key={`${option.value}-${option.direction}`}
            value={`${option.value}-${option.direction}`}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

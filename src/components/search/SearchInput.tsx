import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
}
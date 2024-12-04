import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserSearchParams } from '@/types';

interface SearchFormProps {
  onSearch: (params: UserSearchParams) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ 
      query, 
      language, 
      locations: location ? [location] : undefined,
      page: 1 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Search GitHub users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Programming language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        Search
      </Button>
    </form>
  );
}
import { useState, KeyboardEvent, ChangeEvent, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LocationTags } from '@/components/search/LocationTags';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { UserSearchParams } from '@/types';

interface SearchFormProps {
  onSearch: (params: Omit<UserSearchParams, 'page'>) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [locationInput, setLocationInput] = useState('');
  const [locations, setLocations] = useState<string[]>(
    searchParams.get('locations')?.split(',').filter(Boolean) || []
  );

  const handleSearch = useCallback((): void => {
    if (!query.trim()) {
      onSearch({} as Omit<UserSearchParams, 'page'>);
      return;
    }

    const searchParams: Partial<UserSearchParams> = {
      query: query.trim(),
      ...(language && { language }),
      ...(locations.length > 0 && { locations })
    };

    onSearch(searchParams as Omit<UserSearchParams, 'page'>);
  }, [query, language, locations, onSearch]);

  const handleLocationKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && locationInput.trim()) {
      e.preventDefault();
      const newLocation = locationInput.trim();
      if (!locations.includes(newLocation)) {
        setLocations(prev => [...prev, newLocation]);
        setLocationInput('');
      }
    }
  }, [locationInput, locations]);

  const handleRemoveLocation = useCallback((locationToRemove: string): void => {
    setLocations(prev => prev.filter(loc => loc !== locationToRemove));
  }, []);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    switch (id) {
      case 'query':
        setQuery(value);
        break;
      case 'language':
        setLanguage(value);
        break;
      case 'location':
        setLocationInput(value);
        break;
    }
  }, []);

  return (
    <form className="space-y-4" onSubmit={e => e.preventDefault()}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="query"
          type="text"
          placeholder="Search developers..."
          value={query}
          onChange={handleInputChange}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <Input
          id="language"
          type="text"
          placeholder="Programming language..."
          value={language}
          onChange={handleInputChange}
          className="flex-1"
        />
        <Input
          id="location"
          type="text"
          placeholder="Add location..."
          value={locationInput}
          onChange={handleInputChange}
          onKeyDown={handleLocationKeyDown}
          className="flex-1"
        />
      </div>
      {locations.length > 0 && (
        <LocationTags locations={locations} onRemove={handleRemoveLocation} />
      )}
      <Button 
        type="button" 
        onClick={handleSearch}
        className="w-full"
        disabled={!query.trim()}
      >
        Search Developers
      </Button>
    </form>
  );
}
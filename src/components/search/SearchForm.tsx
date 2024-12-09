import { useState, KeyboardEvent, FormEvent, ChangeEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LocationTags } from '@/components/search/LocationTags';
import { Search } from 'lucide-react';
import type { UserSearchParams } from '@/types';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

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

  // Use debounce to improve input responsiveness
  const debouncedQuery = useDebounce(query, 300);
  const debouncedLanguage = useDebounce(language, 300);
  const debouncedLocations = useDebounce(locations, 300);

  useEffect(() => {
    const urlQuery = searchParams.get('query');
    const urlLanguage = searchParams.get('language');
    const urlLocations = searchParams.get('locations')?.split(',').filter(Boolean) || [];

    if (urlQuery) setQuery(urlQuery);
    if (urlLanguage) setLanguage(urlLanguage);
    setLocations(urlLocations);

    if (urlQuery) {
      handleSearch(urlQuery, urlLanguage || '', urlLocations);
    }
  }, [searchParams]);

  const handleLocationKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && locationInput.trim()) {
      e.preventDefault();
      const newLocation = locationInput.trim();
      if (!locations.includes(newLocation)) {
        const newLocations = [...locations, newLocation];
        setLocations(newLocations);
        setLocationInput('');
      }
    }
  };

  const handleRemoveLocation = (locationToRemove: string): void => {
    const newLocations = locations.filter((loc: string): boolean => loc !== locationToRemove);
    setLocations(newLocations);
  };

  const handleSearch = (
    currentQuery: string,
    currentLanguage: string,
    currentLocations: string[]
  ): void => {
    const searchParams: Partial<UserSearchParams> = {};
    
    if (currentQuery.trim()) {
      searchParams.query = currentQuery.trim();
    }
    
    if (currentLanguage) {
      searchParams.language = currentLanguage;
    }
    
    if (currentLocations.length > 0) {
      searchParams.locations = currentLocations;
    }

    if (Object.keys(searchParams).length > 0) {
      onSearch(searchParams as Omit<UserSearchParams, 'page'>);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    handleSearch(debouncedQuery, debouncedLanguage, debouncedLocations);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === 'query') {
      setQuery(e.target.value);
    } else if (e.target.id === 'language') {
      setLanguage(e.target.value);
    } else if (e.target.id === 'location') {
      setLocationInput(e.target.value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="query"
          placeholder="Search GitHub users..."
          value={query}
          onChange={handleInputChange}
          className="pl-10 h-12"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="language"
          placeholder="Programming language"
          value={language}
          onChange={handleInputChange}
          className="h-10"
        />
        <div className="space-y-2">
          <Input
            id="location"
            placeholder="Location (press Enter to add)"
            value={locationInput}
            onChange={handleInputChange}
            onKeyDown={handleLocationKeyDown}
            className="h-10"
          />
          <LocationTags
            locations={locations}
            onRemove={handleRemoveLocation}
          />
        </div>
      </div>
      <Button type="submit" className="w-full h-10">
        Search Users
      </Button>
    </form>
  );
}
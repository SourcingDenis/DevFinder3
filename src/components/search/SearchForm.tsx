import { useState, KeyboardEvent, FormEvent, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LocationTags } from '@/components/search/LocationTags';
import { Search } from 'lucide-react';
import type { UserSearchParams } from '@/types';
import { useSearchParams } from 'react-router-dom';

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
  const [hireable, setHireable] = useState(searchParams.get('hireable') === 'true');

  const handleLocationKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && locationInput.trim()) {
      e.preventDefault();
      const newLocation = locationInput.trim();
      if (!locations.includes(newLocation)) {
        const newLocations = [...locations, newLocation];
        setLocations(newLocations);
        setLocationInput('');
        handleSearch(query, language, newLocations);
      }
    }
  };

  const handleRemoveLocation = (locationToRemove: string): void => {
    const newLocations = locations.filter((loc: string): boolean => loc !== locationToRemove);
    setLocations(newLocations);
    handleSearch(query, language, newLocations);
  };

  const handleSearch = (
    currentQuery: string,
    currentLanguage: string,
    currentLocations: string[]
  ): void => {
    if (!currentQuery.trim()) return;
    onSearch({
      query: currentQuery.trim(),
      language: currentLanguage,
      locations: currentLocations,
      hireable
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    handleSearch(query, language, locations);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === 'query') {
      setQuery(e.target.value);
    } else if (e.target.id === 'language') {
      setLanguage(e.target.value);
    } else if (e.target.id === 'location') {
      setLocationInput(e.target.value);
    } else if (e.target.id === 'hireable') {
      setHireable(e.target.checked);
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
          required
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
      <div className="flex items-center gap-2">
        <input
          id="hireable"
          type="checkbox"
          checked={hireable}
          onChange={handleInputChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="hireable" className="text-sm text-muted-foreground">
          Only show users available for hire
        </label>
      </div>
      <Button type="submit" className="w-full h-10">
        Search Users
      </Button>
    </form>
  );
}
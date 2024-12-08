import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';
import type { UserSearchParams } from '@/types/github';

interface SavedSearch {
  id: number;
  name: string;
  search_params: UserSearchParams;
  created_at: string;
}

interface SearchHistoryProps {
  onSearch: (params: UserSearchParams) => void;
}

export function SearchHistory({ onSearch }: SearchHistoryProps) {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!user) return;

    const fetchSavedSearches = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_searches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSavedSearches(data || []);
      } catch (err) {
        console.error('Error fetching saved searches:', err);
      }
    };

    fetchSavedSearches();
  }, [user]);

  const handleSearchClick = (search: SavedSearch) => {
    const params = search.search_params;
    onSearch(params);

    // Update URL params
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('query', params.q);
    if (params.language) newSearchParams.set('language', params.language);
    if (params.locations && params.locations.length > 0) {
      newSearchParams.set('locations', params.locations.join(','));
    }
    if (params.sort) newSearchParams.set('sort', params.sort);
    if (params.order) newSearchParams.set('order', params.order);
    if (params.per_page) newSearchParams.set('per_page', params.per_page.toString());
    if (params.hireable !== undefined) newSearchParams.set('hireable', params.hireable.toString());
    setSearchParams(newSearchParams);
  };

  if (!user || savedSearches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Saved Searches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedSearches.map((search) => (
          <Button
            key={search.id}
            variant="outline"
            className="justify-start h-auto p-4"
            onClick={() => handleSearchClick(search)}
          >
            <div className="text-left">
              <div className="font-medium">{search.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {search.search_params.q}
                {search.search_params.language && ` • ${search.search_params.language}`}
                {search.search_params.locations && search.search_params.locations.length > 0 && 
                  ` • ${search.search_params.locations.join(', ')}`}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import type { UserSearchParams } from '@/types';

interface SavedSearch {
  id: number;
  name: string;
  search_params: Omit<UserSearchParams, 'page'>;
  created_at: string;
}

export function SavedSearches() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
        setSearches(data);
      } catch (error) {
        console.error('Error fetching saved searches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedSearches();
  }, [user]);

  const handleExecuteSearch = (searchParams: Omit<UserSearchParams, 'page'>) => {
    const queryString = new URLSearchParams();
    if (searchParams.query) queryString.append('query', searchParams.query);
    if (searchParams.language) queryString.append('language', searchParams.language);
    if (searchParams.locations?.length) queryString.append('locations', searchParams.locations.join(','));
    if (searchParams.sort) queryString.append('sort', searchParams.sort);
    if (searchParams.order) queryString.append('order', searchParams.order);
    if (searchParams.per_page) queryString.append('per_page', String(searchParams.per_page));
    if (typeof searchParams.hireable === 'boolean') queryString.append('hireable', String(searchParams.hireable));
    
    navigate(`/search?${queryString.toString()}`);
  };

  const handleDeleteSearch = async (id: number) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSearches(searches.filter(search => search.id !== id));
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please sign in to view saved searches</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (searches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No saved searches yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searches.map((search) => (
        <div
          key={search.id}
          className="flex items-center justify-between p-4 bg-card rounded-lg shadow border"
        >
          <div>
            <h3 className="font-semibold text-foreground">{search.name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(search.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Query: {search.search_params.query}
              {search.search_params.locations && search.search_params.locations.length > 0 && ` • Location: ${search.search_params.locations.join(', ')}`}
              {search.search_params.language && ` • Language: ${search.search_params.language}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExecuteSearch(search.search_params)}
              variant="default"
            >
              Execute
            </Button>
            <Button
              onClick={() => handleDeleteSearch(search.id)}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import type { UserSearchParams } from '@/types';
import { toast } from 'react-toastify';

interface SavedSearch {
  id: string; 
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
        setSearches(data || []);
      } catch (error) {
        console.error('Error fetching saved searches:', error);
        toast.error('Failed to load saved searches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedSearches();
  }, [user]);

  const handleExecuteSearch = (searchParams: Omit<UserSearchParams, 'page'>) => {
    const queryString = new URLSearchParams();
    
    if (searchParams.query) {
      queryString.append('query', searchParams.query);
    }
    if (searchParams.language) {
      queryString.append('language', searchParams.language);
    }
    if (searchParams.locations?.length) {
      queryString.append('locations', searchParams.locations.join(','));
    }
    if (searchParams.sort) {
      queryString.append('sort', searchParams.sort);
    }
    if (searchParams.order) {
      queryString.append('order', searchParams.order);
    }
    if (searchParams.per_page) {
      queryString.append('per_page', String(searchParams.per_page));
    }
    if (typeof searchParams.hireable === 'boolean') {
      queryString.append('hireable', String(searchParams.hireable));
    }
    
    navigate(`/search?${queryString.toString()}`);
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSearches(searches.filter(search => search.id !== id));
      toast.success('Search deleted successfully');
    } catch (error) {
      console.error('Error deleting saved search:', error);
      toast.error('Failed to delete search');
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
    <div className="grid gap-4">
      {searches.map((search) => (
        <div
          key={search.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card"
        >
          <div className="space-y-1">
            <h3 className="font-medium">{search.name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(search.created_at).toLocaleDateString()}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {search.search_params.query && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {search.search_params.query}
                </span>
              )}
              {search.search_params.language && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {search.search_params.language}
                </span>
              )}
              {search.search_params.locations?.map((location) => (
                <span
                  key={location}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => handleExecuteSearch(search.search_params)}
            >
              Execute Search
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteSearch(search.id)}
            >
              ×
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

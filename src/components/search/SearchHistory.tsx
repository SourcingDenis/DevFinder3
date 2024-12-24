import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Search, ArrowRight } from 'lucide-react';
import type { UserSearchParams, RecentSearch } from '@/types/search';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';

interface SearchHistoryProps {
  onSearch?: (params: Partial<UserSearchParams>) => void;
}

export function SearchHistory({ onSearch }: SearchHistoryProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchRecentSearches = async () => {
      try {
        const { data, error } = await supabase
          .from('recent_searches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        // More efficient deduplication using a Set and Map
        const uniqueSearchesMap = new Map<string, RecentSearch>();
        data?.forEach(search => {
          const searchParamsKey = JSON.stringify(search.search_params);
          if (!uniqueSearchesMap.has(searchParamsKey)) {
            uniqueSearchesMap.set(searchParamsKey, search);
          }
        });

        const uniqueSearches = Array.from(uniqueSearchesMap.values()).slice(0, 5);
        setRecentSearches(uniqueSearches);
      } catch (error) {
        console.error('Error fetching recent searches:', error);
        toast.error('Failed to load recent searches');
      }
    };

    fetchRecentSearches();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('recent_searches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recent_searches',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRecentSearches();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const handleExecuteSearch = (searchParams: Partial<UserSearchParams>) => {
    if (!searchParams || !searchParams.query) {
      console.warn('Invalid search parameters:', searchParams);
      return;
    }

    // First trigger the onSearch callback with the search parameters
    onSearch?.(searchParams);

    // Prepare URL search parameters
    const params = new URLSearchParams();
    
    // Set query
    params.set('query', searchParams.query);
    
    // Add other search parameters
    if (searchParams.language) {
      params.set('language', searchParams.language);
    }
    if (searchParams.locations?.length) {
      params.set('locations', searchParams.locations.join(','));
    }
    if (searchParams.sort) {
      params.set('sort', searchParams.sort);
    }
    if (searchParams.order) {
      params.set('order', searchParams.order);
    }
    if (searchParams.per_page) {
      params.set('per_page', String(searchParams.per_page));
    }
    if (searchParams.hireable !== undefined) {
      params.set('hireable', String(searchParams.hireable));
    }

    // Use setSearchParams to update URL and trigger search
    setSearchParams(params);
  };

  if (!user || recentSearches.length === 0) return null;

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const searchDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - searchDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return searchDate.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <h2 className="text-sm font-medium">Recent Searches</h2>
      </div>

      <div className="grid gap-2">
        {recentSearches.map((search) => (
          <Card
            key={search.id}
            className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => {
              // Ensure we have the required search parameters
              const searchParams = {
                ...search.search_params,
                page: 1 // Reset page to 1 for new searches
              };
              handleExecuteSearch(searchParams);
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{search.query}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {search.search_params.language && (
                    <Badge variant="secondary" className="text-xs">
                      {search.search_params.language}
                    </Badge>
                  )}
                  {search.search_params.locations?.map((location) => (
                    <Badge key={location} variant="secondary" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(search.created_at)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

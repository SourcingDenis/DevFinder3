import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Search, ArrowRight } from 'lucide-react';
import type { UserSearchParams } from '@/types';

interface SearchHistoryProps {
  onSearch?: (params: Partial<UserSearchParams>) => void;
}

interface RecentSearch {
  id: string;
  query: string;
  search_params: Omit<UserSearchParams, 'page'>;
  created_at: string;
}

export function SearchHistory({ onSearch }: SearchHistoryProps) {
  const { user } = useAuth();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchRecentSearches = async () => {
      const { data, error } = await supabase
        .from('recent_searches')
        .select('id, query, search_params, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10); // Fetch more initially to allow for deduplication

      if (error) {
        console.error('Error fetching recent searches:', error);
        return;
      }

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

  const handleExecuteSearch = (searchParams: Omit<UserSearchParams, 'page'>) => {
    // First trigger the onSearch callback with the search parameters
    onSearch?.(searchParams);

    // Construct a comprehensive query
    let fullQuery = searchParams.query || '';
    if (searchParams.language) {
      fullQuery += ` language:${searchParams.language}`;
    }

    // Prepare URL search parameters
    const params = new URLSearchParams();
    
    // Set query with language
    params.set('query', fullQuery.trim());
    
    // Add other search parameters
    if (searchParams.language) params.set('language', searchParams.language);
    if (searchParams.locations?.length) params.set('locations', searchParams.locations.join(','));
    if (searchParams.sort) params.set('sort', searchParams.sort);
    if (searchParams.order) params.set('order', searchParams.order);
    if (searchParams.per_page) params.set('per_page', String(searchParams.per_page));
    if (searchParams.hireable !== undefined) params.set('hireable', String(searchParams.hireable));

    // Navigate to search page with full query parameters
    window.location.href = `/search?${params.toString()}`;
  };

  if (!user || recentSearches.length === 0) return null;

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const searchDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - searchDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card className="p-4 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <Clock className="w-4 h-4 text-primary/70" />
        <h3 className="text-base font-semibold tracking-tight">Recent Searches</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {recentSearches.map((search) => (
          <Button
            key={search.id}
            variant="ghost"
            className="w-full justify-start h-auto py-2.5 px-3 hover:bg-accent/60 group transition-all duration-200 ease-in-out rounded-lg border border-border/40 hover:border-border/80"
            onClick={() => handleExecuteSearch(search.search_params)}
          >
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center gap-2 w-full">
                <Search className="w-4 h-4 shrink-0 text-primary/70 group-hover:text-primary transition-colors" />
                <div className="font-medium text-left truncate flex-1 group-hover:text-primary transition-colors">
                  {search.query}
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 text-primary/70 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-0 group-hover:translate-x-1" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pl-6">
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                  <Clock className="w-3 h-3 mr-1 opacity-70" />
                  {formatTimeAgo(search.created_at)}
                </Badge>
                {search.search_params.locations?.map((location) => (
                  <Badge key={location} variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                    {location}
                  </Badge>
                ))}
                {search.search_params.language && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-primary/5">
                    {search.search_params.language}
                  </Badge>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}

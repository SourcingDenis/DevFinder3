import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Search, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { UserSearchParams } from '@/types';

interface SearchHistoryProps {
  onSearch?: () => void;
}

interface RecentSearch {
  id: string;
  query: string;
  search_params: Omit<UserSearchParams, 'page'>;
  created_at: string;
}

export function SearchHistory({ onSearch }: SearchHistoryProps) {
  const { user } = useAuth();
  const [, setSearchParams] = useSearchParams();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchRecentSearches = async () => {
      const { data, error } = await supabase
        .from('recent_searches')
        .select('id, query, search_params, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recent searches:', error);
        return;
      }

      // Deduplicate searches by comparing all search parameters
      const uniqueSearches = data?.reduce((acc: RecentSearch[], curr) => {
        if (!acc.some(search => 
          JSON.stringify(search.search_params) === JSON.stringify(curr.search_params)
        )) {
          acc.push(curr);
        }
        return acc;
      }, []).slice(0, 5) || [];

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
    // First trigger the onSearch callback to reset the state
    onSearch?.();

    // Update the URL search parameters
    const params = new URLSearchParams();
    
    // Set all search parameters in the URL
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else if (typeof value === 'boolean') {
          params.set(key, String(value));
        } else {
          params.set(key, String(value));
        }
      }
    });

    // Update the URL without adding a new history entry
    setSearchParams(params, { replace: true });
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
    <Card className="p-6 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <Clock className="w-4 h-4 text-primary/70" />
        <h3 className="text-base font-semibold tracking-tight">Recent Searches</h3>
      </div>
      <div className="space-y-2.5">
        {recentSearches.map((search) => (
          <Button
            key={search.id}
            variant="ghost"
            className="w-full justify-start h-auto py-3.5 px-4 hover:bg-accent/60 group transition-all duration-200 ease-in-out rounded-lg"
            onClick={() => handleExecuteSearch(search.search_params)}
          >
            <div className="flex items-center gap-3.5 w-full">
              <Search className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
              <div className="flex-1 truncate">
                <div className="font-medium text-left truncate group-hover:text-primary transition-colors">{search.query}</div>
                <div className="text-xs text-muted-foreground/80 space-x-2 mt-0.5">
                  <span className="inline-flex items-center">
                    <Clock className="w-3 h-3 mr-1 opacity-70" />
                    {formatTimeAgo(search.created_at)}
                  </span>
                  {search.search_params.locations && search.search_params.locations.length > 0 && (
                    <span className="inline-flex items-center">•
                      <span className="ml-1.5 text-primary/70">
                        {search.search_params.locations.join(', ')}
                      </span>
                    </span>
                  )}
                  {search.search_params.language && (
                    <span className="inline-flex items-center">•
                      <span className="ml-1.5 text-primary/70">
                        {search.search_params.language}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-primary/70 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-0 group-hover:translate-x-1" />
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}

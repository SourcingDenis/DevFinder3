import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Search, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">Recent Searches</h3>
      </div>
      <div className="space-y-2">
        {recentSearches.map((search) => (
          <Button
            key={search.id}
            variant="ghost"
            className="w-full justify-start h-auto py-3 px-4 hover:bg-accent group"
            onClick={() => handleExecuteSearch(search.search_params)}
          >
            <div className="flex items-center gap-3 w-full">
              <Search className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 truncate">
                <div className="font-medium text-left truncate">{search.query}</div>
                <div className="text-xs text-muted-foreground space-x-2">
                  <span>{formatTimeAgo(search.created_at)}</span>
                  {search.search_params.locations?.length > 0 && (
                    <span>• Location: {search.search_params.locations.join(', ')}</span>
                  )}
                  {search.search_params.language && (
                    <span>• Language: {search.search_params.language}</span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}

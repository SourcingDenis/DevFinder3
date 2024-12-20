import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Bookmark, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ActivityItem } from '@/types/activity';
import type { RecentSearch } from '@/types/search';
import type { SavedProfile } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function ActivityFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user) {
      console.log('ActivityFeed: No user found');
      return;
    }
    
    try {
      console.log('ActivityFeed: Fetching activities for user', user.id);
      
      // Fetch recent searches
      const { data: searches, error: searchError } = await supabase
        .from('recent_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchError) {
        console.error('ActivityFeed: Error fetching searches:', searchError);
        throw searchError;
      }

      console.log('ActivityFeed: Found searches:', searches?.length || 0);

      // Fetch saved profiles
      const { data: profiles, error: profileError } = await supabase
        .from('saved_profiles')
        .select('*, github_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (profileError) {
        console.error('ActivityFeed: Error fetching profiles:', profileError);
        throw profileError;
      }

      console.log('ActivityFeed: Found profiles:', profiles?.length || 0);

      // Combine and sort activities
      const searchActivities: ActivityItem[] = (searches || []).map((search: RecentSearch) => ({
        id: search.id,
        type: 'search',
        timestamp: search.created_at,
        data: {
          query: search.query,
          searchParams: search.search_params,
        },
      }));

      const saveActivities: ActivityItem[] = (profiles || []).map((profile: SavedProfile) => ({
        id: profile.id.toString(),
        type: 'save',
        timestamp: profile.created_at,
        data: {
          user: {
            login: profile.username,
            name: profile.github_data?.name,
            avatar_url: profile.github_data?.avatar_url,
          },
          listId: profile.list_id,
        },
      }));

      const allActivities = [...searchActivities, ...saveActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      console.log('ActivityFeed: Combined activities:', allActivities.length);
      setActivities(allActivities);
    } catch (error) {
      console.error('ActivityFeed: Error:', error);
      toast.error('Failed to load activity feed');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();

    // Subscribe to changes
    const searchChannel = supabase
      .channel('recent_searches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recent_searches',
        },
        () => fetchActivities()
      )
      .subscribe();

    const profileChannel = supabase
      .channel('saved_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_profiles',
        },
        () => fetchActivities()
      )
      .subscribe();

    return () => {
      searchChannel.unsubscribe();
      profileChannel.unsubscribe();
    };
  }, [fetchActivities]);

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.type === 'search') {
      navigate(`/search?q=${encodeURIComponent(activity.data.query)}`);
    } else if (activity.type === 'save') {
      navigate(`/saved-profiles`);
    }
  };

  if (!user) {
    console.log('ActivityFeed: No user, returning null');
    return null;
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Search className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading activities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    console.log('ActivityFeed: No activities, returning null');
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[300px] overflow-y-auto pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => handleActivityClick(activity)}
              >
                {activity.type === 'search' ? (
                  <Search className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.type === 'search' ? (
                      <>Searched for "{activity.data.query}"</>
                    ) : (
                      <>Saved profile <span className="text-primary">@{activity.data.user.login}</span>
                        {activity.data.user.name && (
                          <span className="text-muted-foreground"> ({activity.data.user.name})</span>
                        )}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

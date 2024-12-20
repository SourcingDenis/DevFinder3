import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Bookmark, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ActivityType } from '@/types';
import { useNavigate } from 'react-router-dom';

interface BaseActivity {
  id: string;
  type: ActivityType;
  timestamp: string;
  data: any;
}

interface SearchActivityData extends BaseActivity {
  type: 'search';
  data: {
    query: string;
    searchParams: any;
  };
}

interface SaveActivityData extends BaseActivity {
  type: 'save';
  data: {
    user: {
      login: string;
      name?: string;
    };
    listId?: number;
  };
}

type Activity = SearchActivityData | SaveActivityData;

function isSearchActivity(activity: Activity): activity is SearchActivityData {
  return activity.type === 'search';
}

function isSaveActivity(activity: Activity): activity is SaveActivityData {
  return activity.type === 'save';
}

export function ActivityFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!user) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch recent searches
      console.log('ActivityFeed: Fetching recent searches for user:', user.id);
      const { data: searches, error: searchError } = await supabase
        .from('recent_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchError) {
        console.error('ActivityFeed: Error fetching searches:', {
          message: searchError.message,
          details: searchError.details,
          hint: searchError.hint,
          code: searchError.code
        });
        setError('Failed to fetch recent searches');
        throw searchError;
      }

      console.log('ActivityFeed: Found searches:', {
        count: searches?.length || 0,
        searches: searches
      });

      // Fetch saved profiles
      const { data: profiles, error: profileError } = await supabase
        .from('saved_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (profileError) {
        console.error('ActivityFeed: Error fetching profiles:', profileError);
        setError('Failed to fetch saved profiles');
        throw profileError;
      }

      // Combine and sort activities
      const searchActivities: Activity[] = (searches || []).map((search) => ({
        id: search.id,
        type: 'search' as const,
        timestamp: search.created_at,
        data: {
          query: search.query,
          searchParams: search.search_params
        },
      }));

      const saveActivities: Activity[] = (profiles || []).map((profile) => ({
        id: profile.id.toString(),
        type: 'save' as const,
        timestamp: profile.created_at,
        data: {
          user: {
            login: profile.username,
            name: profile.github_data?.name,
          },
          listId: profile.list_id
        },
      }));

      const allActivities = [...searchActivities, ...saveActivities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setError('Failed to fetch activities');
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleActivityClick = (activity: Activity) => {
    if (isSearchActivity(activity)) {
      navigate(`/search?q=${encodeURIComponent(activity.data.query)}`);
    } else if (isSaveActivity(activity)) {
      navigate(`/saved-profiles`);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive p-4">{error}</div>
        ) : activities.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4">
            No recent activity
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-lg cursor-pointer"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="flex items-center gap-4">
                    {isSearchActivity(activity) ? (
                      <Search className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Bookmark className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <div className="text-sm">
                        {isSearchActivity(activity) ? (
                          <>Searched for "{activity.data.query}"</>
                        ) : isSaveActivity(activity) && (
                          <>
                            Saved profile <span className="text-primary">@{activity.data.user.login}</span>
                            {activity.data.user.name && (
                              <span className="text-muted-foreground"> ({activity.data.user.name})</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp))} ago
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

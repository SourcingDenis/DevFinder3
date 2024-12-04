import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { UserCard } from '../user/UserCard';
import { LoadingSpinner } from '../ui/loading-spinner';
import type { GitHubUser } from '@/types';

interface SavedProfile {
  id: number;
  github_data: GitHubUser;
}

export function SavedProfiles() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSavedProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_profiles')
          .select('id, github_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProfiles(data);
      } catch (error) {
        console.error('Error fetching saved profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedProfiles();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please sign in to view saved profiles</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No saved profiles yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {profiles.map((profile) => (
        <UserCard key={profile.id} user={profile.github_data} isSaved={true} />
      ))}
    </div>
  );
}
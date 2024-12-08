import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { UserCard } from '../user/UserCard';
import { LoadingSpinner } from '../ui/loading-spinner';
import type { GitHubUser } from '@/types';

interface SavedProfile {
  id: number;
  user_id: string;
  github_username: string;
  github_data: GitHubUser;
  created_at: string;
  enriched_emails?: { 
    email: string; 
    source: string; 
    enriched_at: string 
  }[];
}

export function SavedProfiles() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedProfiles = async () => {
    if (!user) return;

    try {
      // Fetch saved profiles with their enriched emails
      const { data, error } = await supabase
        .from('saved_profiles')
        .select(`
          id, 
          github_username, 
          github_data, 
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching saved profiles:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedProfiles();
  }, [user]);

  const handleProfileRemove = (removedProfileLogin: string) => {
    setProfiles(currentProfiles => 
      currentProfiles.filter(profile => profile.github_username !== removedProfileLogin)
    );
  };

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
        <UserCard 
          key={profile.id} 
          user={{
            ...profile.github_data,
          }} 
          isSaved={true} 
          onRemoveSaved={() => handleProfileRemove(profile.github_username)}
        />
      ))}
    </div>
  );
}
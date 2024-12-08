import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserCard } from '../user/UserCard';
import { LoadingSpinner } from '../ui/loading-spinner';
import type { GitHubUser } from '@/types/github';

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
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedProfiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('saved_profiles')
        .select(`
          id, 
          user_id,
          github_username, 
          github_data, 
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data.map((profile: any) => ({
        id: profile.id,
        user_id: profile.user_id,
        github_username: profile.github_username,
        github_data: {
          ...profile.github_data,
          public_gists: profile.github_data.public_gists || 0,
          updated_at: profile.github_data.updated_at || profile.github_data.created_at,
          languages: profile.github_data.languages || [],
          topLanguage: profile.github_data.topLanguage || null,
          available_for_hire: profile.github_data.available_for_hire || false
        } as GitHubUser,
        created_at: profile.created_at,
      })));
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
  }, []);

  const handleProfileRemove = (removedProfileLogin: string) => {
    setProfiles(currentProfiles => 
      currentProfiles.filter(profile => profile.github_username !== removedProfileLogin)
    );
  };

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
          user={profile.github_data}
          isSaved={true} 
          onRemoveSaved={() => handleProfileRemove(profile.github_username)}
        />
      ))}
    </div>
  );
}
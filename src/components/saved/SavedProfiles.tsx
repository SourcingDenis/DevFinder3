import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { UserCard } from '../user/UserCard';
import { LoadingSpinner } from '../ui/loading-spinner';
import type { SavedProfile } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export function SavedProfiles() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSavedProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_profiles')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: 'Error',
          description: `Failed to fetch saved profiles: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      // Ensure the data matches SavedProfile type
      const mappedProfiles: SavedProfile[] = data.map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        github_username: profile.github_username,
        github_data: profile.github_data,
        created_at: profile.created_at
      }));

      setProfiles(mappedProfiles);
      setIsLoading(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching saved profiles.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedProfiles();
  }, [user]);

  const handleRemoveSavedProfile = async (githubUsername: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', user.id)
        .eq('github_username', githubUsername);

      if (error) {
        toast({
          title: 'Error',
          description: `Failed to remove profile: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      // Update local state by filtering out the removed profile
      setProfiles(currentProfiles => 
        currentProfiles.filter(profile => profile.github_username !== githubUsername)
      );

      toast({
        title: 'Profile Removed',
        description: `${githubUsername} has been removed from your saved profiles.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
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
          user={JSON.parse(profile.github_data)} 
          isSaved={true} 
          onRemove={() => handleRemoveSavedProfile(profile.github_username)}
        />
      ))}
    </div>
  );
}
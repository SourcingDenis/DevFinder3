import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { GitHubUser } from '@/types';

interface SaveProfileButtonProps {
  user: GitHubUser;
  isSaved?: boolean;
  onSaveToggle?: (saved: boolean) => void;
}

export function SaveProfileButton({ 
  user, 
  isSaved = false, 
  onSaveToggle 
}: SaveProfileButtonProps) {
  const { user: authUser } = useAuth();
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);

  // Check if profile is already saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!authUser) return;

      try {
        const { data, error } = await supabase
          .from('saved_profiles')
          .select('id')
          .eq('user_id', authUser.id)
          .eq('github_username', user.login)
          .single();

        if (error) {
          // No existing record found
          setSaved(false);
          return;
        }

        setSaved(!!data);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkSavedStatus();
  }, [authUser, user.login]);

  const handleSave = async () => {
    if (!authUser) return;
    
    setIsLoading(true);
    try {
      if (saved) {
        // Remove from saved profiles
        const { error } = await supabase
          .from('saved_profiles')
          .delete()
          .eq('user_id', authUser.id)
          .eq('github_username', user.login);

        if (error) throw error;
        setSaved(false);
        onSaveToggle?.(false);
      } else {
        // Add to saved profiles
        const { error } = await supabase
          .from('saved_profiles')
          .insert({
            user_id: authUser.id,
            github_username: user.login,
            github_data: user
          });

        if (error) throw error;
        setSaved(true);
        onSaveToggle?.(true);
      }
    } catch (error) {
      console.error('Error saving profile:', {
        error,
        userId: authUser.id,
        githubUsername: user.login,
        action: saved ? 'delete' : 'insert'
      });
      // Re-throw the error to trigger error boundaries if they exist
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!authUser) return null;

  return (
    <Button
      variant={saved ? "default" : "outline"}
      size="sm"
      onClick={handleSave}
      disabled={isLoading || !authUser}
      className={saved ? "sm:flex hidden" : undefined}
    >
      <Bookmark className={`h-4 w-4 mr-2 ${saved ? 'fill-current' : ''}`} />
      {saved ? 'Saved' : 'Save Profile'}
    </Button>
  );
}
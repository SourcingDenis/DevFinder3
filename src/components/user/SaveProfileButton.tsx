import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { GitHubUser } from '@/types';

interface SaveProfileButtonProps {
  user: GitHubUser;
  isSaved?: boolean;
}

export function SaveProfileButton({ user, isSaved = false }: SaveProfileButtonProps) {
  const { user: authUser } = useAuth();
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);

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
      disabled={isLoading}
      className="gap-2"
    >
      <Bookmark className="h-4 w-4" />
      {saved ? 'Saved' : 'Save Profile'}
    </Button>
  );
}
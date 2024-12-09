import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { GitHubUser, SavedProfile, ProfileList } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export function SaveProfileButton({ 
  user, 
  onSave, 
  onRemove,
  isSaved = false,
  className = '' 
}: { 
  user: GitHubUser;
  onSave?: (profile: SavedProfile) => void;
  onRemove?: (githubUsername: string) => void;
  isSaved?: boolean;
  className?: string;
}) {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(isSaved);
  const [lists, setLists] = useState<ProfileList[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!authUser) return;

      const { data, error } = await supabase
        .from('saved_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('github_username', user.login)
        .single();

      if (error) {
        setSaved(false);
        return;
      }

      setSaved(!!data);
    };

    checkSavedStatus();
  }, [authUser, user.login]);

  useEffect(() => {
    const fetchLists = async () => {
      if (!authUser) return;

      const { data } = await supabase
        .from('profile_lists')
        .select('*')
        .eq('user_id', authUser.id);

      if (data) {
        setLists(data);
      }
    };

    fetchLists();
  }, [authUser]);

  const handleSaveProfile = async () => {
    if (!authUser) return;

    try {
      const { data, error } = await supabase
        .from('saved_profiles')
        .insert({
          user_id: authUser.id,
          github_username: user.login,
          github_data: user,
          created_at: new Date().toISOString(),
          list_id: selectedListId
        })
        .select()
        .single();

      if (error) throw error;

      setSaved(true);
      onSave?.(data);
      setIsDialogOpen(false);
      
      toast({
        title: 'Profile Saved',
        description: selectedListId 
          ? `${user.login} has been saved to your list.` 
          : `${user.login} has been saved to your profiles.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save profile.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveProfile = async () => {
    if (!authUser) return;

    try {
      const { error } = await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', authUser.id)
        .eq('github_username', user.login);

      if (error) throw error;

      setSaved(false);
      onRemove?.(user.login);
      
      toast({
        title: 'Profile Removed',
        description: `${user.login} has been removed from your saved profiles.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove profile.',
        variant: 'destructive',
      });
    }
  };

  const handleListChange = (value: string) => {
    // Convert value to number or null
    setSelectedListId(value === 'no-list' ? null : parseInt(value, 10));
  };

  if (!authUser) return null;

  if (saved) {
    return (
      <Button
        variant="default"
        onClick={handleRemoveProfile}
      >
        <Bookmark className="h-4 w-4 fill-current" />
        Remove
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`h-8 w-8 ${className}`}
          onClick={() => setIsDialogOpen(true)}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select 
            value={selectedListId !== null ? selectedListId.toString() : 'no-list'} 
            onValueChange={handleListChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a list (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-list">No List</SelectItem>
              {lists.map((list) => (
                <SelectItem key={list.id} value={list.id.toString()}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleSaveProfile} 
            className="w-full"
          >
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, X } from 'lucide-react';
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

  // Update saved state when isSaved prop changes
  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!authUser) return;

      const { data, error } = await supabase
        .from('saved_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('username', user.login)
        .single();

      if (error) {
        setSaved(false);
        return;
      }

      setSaved(!!data);
    };

    // Only check saved status if isSaved is false
    if (!isSaved) {
      checkSavedStatus();
    }
  }, [authUser, user.login, isSaved]);

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
      const profileData = {
        user_id: authUser.id,
        username: user.login,
        email: user.email || null,
        email_source: user.email ? 'github_profile' : null,
        github_url: user.html_url,
        github_data: user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(selectedListId !== null && { list_id: selectedListId })
      };

      const { data, error } = await supabase
        .from('saved_profiles')
        .insert(profileData)
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
        description: `Failed to save profile: ${(err as Error).message}`,
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
        .eq('username', user.login);

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
        description: `Failed to remove profile: ${(err as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  const handleListChange = (value: string) => {
    if (value === 'no-list') {
      setSelectedListId(null);
      return;
    }
    
    const parsedId = parseInt(value, 10);
    if (isNaN(parsedId)) {
      toast({
        title: 'Error',
        description: 'Invalid list selection',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedListId(parsedId);
  };

  if (!authUser) return null;

  if (saved) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRemoveProfile}
        className={`h-8 w-8 hover:bg-destructive/10 hover:text-destructive ${className}`}
      >
        <X className="h-4 w-4" />
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
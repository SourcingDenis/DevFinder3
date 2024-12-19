import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { UserCard } from '../user/UserCard';
import { LoadingSpinner } from '../ui/loading-spinner';
import type { SavedProfile, ProfileList } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogTrigger,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';

export function SavedProfiles() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [lists, setLists] = useState<ProfileList[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchSavedProfiles = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping fetch. User state:', { user });
      return;
    }

    try {
      console.log('Starting to fetch profiles. Auth state:', { 
        userId: user.id,
        isAuthenticated: !!user,
        userMetadata: user.user_metadata 
      });
      console.log('Fetching profiles for user:', user.id);
      // Fetch lists first
      const { data: listData, error: listError } = await supabase
        .from('profile_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      console.log('Profile lists query result:', { 
        success: !listError,
        listCount: listData?.length || 0,
        error: listError?.message,
        query: `user_id = ${user.id}`
      });

      if (listError) {
        console.error('Error fetching lists:', listError);
        toast({
          title: 'Error',
          description: `Failed to fetch profile lists: ${listError.message}`,
          variant: 'destructive',
        });
        return;
      }

      setLists(listData || []);

      // Fetch profiles, optionally filtered by list
      console.log('Selected List ID:', selectedListId);
      const query = supabase
        .from('saved_profiles')
        .select('id, user_id, username, github_data, list_id, created_at, updated_at')
        .eq('user_id', user.id);

      if (selectedListId !== null) {
        // If a specific list is selected, filter by that list
        query.eq('list_id', selectedListId);
        console.log('Fetching profiles for list:', selectedListId);
      } else {
        // If "No List" is selected, filter for profiles with null list_id
        query.is('list_id', null);
        console.log('Fetching profiles with no list');
      }

      console.log('Query Details:', {
        userId: user.id,
        selectedListId,
        queryType: selectedListId !== null ? 'specific list' : 'no list'
      });

      const { data, error } = await query;
      
      console.log('Saved profiles query result:', {
        success: !error,
        profileCount: data?.length || 0,
        error: error?.message,
        query: `user_id = ${user.id}${selectedListId !== null ? ` AND list_id = ${selectedListId}` : ' AND list_id IS NULL'}`,
        rawData: data
      });

      console.log('Fetched profiles data:', {
        count: data?.length || 0,
        profiles: data?.map(p => ({
          id: p.id,
          username: p.username,
          hasGithubData: !!p.github_data,
          githubDataKeys: p.github_data ? Object.keys(p.github_data) : []
        }))
      });
      console.log('Raw Saved Profiles Data:', data);
      console.log('Query Error:', error);

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch saved profiles: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      // Validate the profiles
      const mappedProfiles = data
        .filter(profile => {
          const isValid = profile.github_data && 
            typeof profile.github_data === 'object' && 
            'login' in profile.github_data && 
            'avatar_url' in profile.github_data && 
            'id' in profile && 
            'user_id' in profile && 
            'username' in profile && 
            'created_at' in profile;
          
          if (!isValid) {
            console.warn('Invalid profile found:', {
              id: profile.id,
              username: profile.username,
              hasGithubData: !!profile.github_data,
              githubDataKeys: profile.github_data ? Object.keys(profile.github_data) : []
            });
          }
          return isValid;
        })
        .map(profile => {
          const validatedProfile = {
            id: profile.id,
            user_id: profile.user_id,
            username: profile.username,
            github_data: profile.github_data,
            created_at: profile.created_at,
            list_id: profile.list_id,
            email: null,
            email_source: undefined,
            github_url: undefined,
            updated_at: profile.updated_at
          } as SavedProfile;

          return validatedProfile;
        });

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
  }, [user, toast, selectedListId]);

  useEffect(() => {
    fetchSavedProfiles();
  }, [fetchSavedProfiles]);

  const handleRemoveSavedProfile = useCallback(async (username: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', user.id)
        .eq('username', username);

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
        currentProfiles.filter(profile => profile.github_data?.login !== username)
      );

      toast({
        title: 'Profile Removed',
        description: `${username} has been removed from your saved profiles.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const handleCreateList = async () => {
    if (!user || !newListName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('profile_lists')
        .insert({
          user_id: user.id,
          name: newListName.trim(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: `Failed to create list: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      setLists(currentLists => [...currentLists, data]);
      setNewListName('');
      toast({
        title: 'List Created',
        description: `List "${newListName}" has been created.`,
      });

      // Close the dialog
      setIsDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating the list.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (!user) return;

    try {
      // First, remove all profiles from this list
      await supabase
        .from('saved_profiles')
        .update({ list_id: null })
        .eq('user_id', user.id)
        .eq('list_id', listId);

      // Then delete the list
      const { error } = await supabase
        .from('profile_lists')
        .delete()
        .eq('id', listId);

      if (error) {
        toast({
          title: 'Error',
          description: `Failed to delete list: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      setLists(currentLists => currentLists.filter(list => list.id !== listId));
      setSelectedListId(null);
      toast({
        title: 'List Deleted',
        description: 'The list has been deleted.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the list.',
        variant: 'destructive',
      });
    }
  };

  // Memoize rendering logic
  const renderContent = useMemo(() => {
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

    console.log('Profiles:', profiles.map(p => ({
      id: p.id,
      username: p.username,
      listId: p.list_id,
      listName: lists.find(l => l.id === p.list_id)?.name
    })));
    console.log('Lists:', lists.map(l => ({ id: l.id, name: l.name })));

    return (
      <div className="flex space-x-4">
        {/* Lists Sidebar */}
        <div className="w-1/4 bg-card p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My Lists</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New List</DialogTitle>
                  <DialogDescription>
                    Create a new list to organize your saved profiles.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="List name" 
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                  />
                  <Button 
                    onClick={handleCreateList}
                    disabled={!newListName.trim()}
                  >
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Button 
            variant={selectedListId === null ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setSelectedListId(null)}
          >
            All Profiles
          </Button>
          
          {lists.map((list) => (
            <div key={list.id} className="flex items-center justify-between">
              <Button 
                variant={selectedListId === list.id ? 'secondary' : 'ghost'} 
                className="flex-1 justify-start"
                onClick={() => setSelectedListId(list.id)}
              >
                {list.name}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteList(list.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Profiles List */}
        <div className="w-3/4">
          {profiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {selectedListId 
                  ? "No profiles in this list yet" 
                  : "No saved profiles yet"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {profiles.map(profile => {
                const associatedList = lists.find(l => l.id === profile.list_id);
                console.log('Profile Details:', {
                  profileId: profile.id,
                  username: profile.username,
                  listId: profile.list_id,
                  listName: associatedList?.name,
                  listsAvailable: lists.map(l => ({ id: l.id, name: l.name }))
                });
                return {
                  ...profile,
                  listName: associatedList?.name
                };
              }).map((profile) => (
                <UserCard 
                  key={profile.id} 
                  user={profile.github_data} 
                  listName={profile.listName}
                  isSaved={true} 
                  onRemove={() => handleRemoveSavedProfile(profile.username)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [
    user, 
    isLoading, 
    profiles, 
    lists, 
    selectedListId, 
    newListName, 
    handleRemoveSavedProfile, 
    handleCreateList,
    handleDeleteList,
    isDialogOpen
  ]);

  return renderContent;
}
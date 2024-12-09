import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import type { ProfileList, SavedProfile } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';

export function SavedProfileListSelector({ 
  savedProfile, 
  onListChange 
}: { 
  savedProfile: SavedProfile, 
  onListChange?: (listId: number | null) => void 
}) {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [lists, setLists] = useState<ProfileList[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(savedProfile.list_id || null);
  const [newListName, setNewListName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch user's lists when component mounts
  useEffect(() => {
    const fetchLists = async () => {
      if (!authUser) return;

      try {
        const { data, error } = await supabase
          .from('profile_lists')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching lists:', error);
          return;
        }

        setLists(data || []);
      } catch (error) {
        console.error('Unexpected error fetching lists:', error);
      }
    };

    fetchLists();
  }, [authUser]);

  const handleCreateList = async () => {
    if (!authUser || !newListName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('profile_lists')
        .insert({
          user_id: authUser.id,
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
      setSelectedListId(data.id);
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

  const handleListChange = async (listId: number | null) => {
    if (!authUser) return;

    try {
      const { error } = await supabase
        .from('saved_profiles')
        .update({ list_id: listId })
        .eq('id', savedProfile.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update profile list.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedListId(listId);
      onListChange?.(listId);
      
      toast({
        title: 'Profile Updated',
        description: `Profile moved to ${listId ? lists.find(l => l.id === listId)?.name : 'No List'}`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  if (!authUser) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Select 
        value={selectedListId ? String(selectedListId) : undefined} 
        onValueChange={(value) => handleListChange(value ? Number(value) : null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a list" />
        </SelectTrigger>
        <SelectContent>
          {/* Option to remove from any list */}
          <SelectItem value="null">No List</SelectItem>
          
          {/* Existing lists */}
          {lists.map((list) => (
            <SelectItem key={list.id} value={String(list.id)}>
              {list.name}
            </SelectItem>
          ))}
          
          {/* Create new list option */}
          <div className="p-2 border-t flex items-center space-x-2">
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full justify-start"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New List
              </Button>
            </DialogTrigger>
          </div>
        </SelectContent>
      </Select>

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
  );
}

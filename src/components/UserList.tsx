import { GitHubUser } from '@/types';
import { UserCard } from './UserCard';

interface UserListProps {
  users: GitHubUser[];
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No users found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
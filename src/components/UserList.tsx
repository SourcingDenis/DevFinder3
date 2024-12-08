import type { GitHubUser } from '@/types/github';
import { UserCard } from '@/components/user/UserCard';

interface UserListProps {
  users: GitHubUser[];
  searchExecuted?: boolean;
}

export function UserList({ users, searchExecuted }: UserListProps) {
  if (users.length === 0 && searchExecuted) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No users found</p>
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
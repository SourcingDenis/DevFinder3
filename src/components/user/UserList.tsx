import React from 'react';
import { GitHubUser } from '@/types/github';
import { UserCard } from './UserCard';

interface UserListProps {
  users: GitHubUser[];
  searchExecuted?: boolean;  // true when search returned no matches
}

export const UserList: React.FC<UserListProps> = ({ users, searchExecuted = false }) => {
  // Only show "no results" message when search was executed and returned no matches
  if (searchExecuted) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No users found. Try adjusting your search criteria.
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 p-4">
      {users.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
        />
      ))}
    </div>
  );
};
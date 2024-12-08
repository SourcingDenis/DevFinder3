import { Users, BookOpen, GitFork } from 'lucide-react';
import type { GitHubUser } from '@/types';

interface UserStatsProps {
  user: GitHubUser;
}

export function UserStats({ user }: UserStatsProps) {
  const stats = [
    { icon: Users, label: 'Followers', value: user.followers || 0 },
    { icon: Users, label: 'Following', value: user.following || 0 },
    { icon: BookOpen, label: 'Repos', value: user.public_repos || 0 },
    { icon: GitFork, label: 'Forks', value: user.public_gists || 0 },
  ];

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 mt-2">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-1 p-2 sm:p-0 rounded-lg bg-muted/50 sm:bg-transparent">
          <Icon className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
          <div className="text-center sm:text-left">
            <div className="font-medium">{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
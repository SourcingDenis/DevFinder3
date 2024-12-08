import { GitHubUser } from '@/types/github';

interface UserStatsProps {
  user: GitHubUser;
  className?: string;
}

export function UserStats({ user, className }: UserStatsProps) {
  return (
    <div className={className}>
      <div className="flex gap-4">
        <div>
          <span className="text-sm font-medium">{user.public_repos}</span>
          <span className="text-xs text-muted-foreground ml-1">Repositories</span>
        </div>
        <div>
          <span className="text-sm font-medium">{user.followers}</span>
          <span className="text-xs text-muted-foreground ml-1">Followers</span>
        </div>
        <div>
          <span className="text-sm font-medium">{user.following}</span>
          <span className="text-xs text-muted-foreground ml-1">Following</span>
        </div>
      </div>
    </div>
  );
}
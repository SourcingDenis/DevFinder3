import { GitHubUser } from '@/types/github';

interface UserEmailsProps {
  user: GitHubUser;
  className?: string;
}

export function UserEmails({ user, className }: UserEmailsProps) {
  if (!user.email) return null;

  return (
    <div className={className}>
      <div className="text-sm">
        <span className="font-medium">Email: </span>
        <a
          href={`mailto:${user.email}`}
          className="text-muted-foreground hover:underline"
        >
          {user.email}
        </a>
      </div>
    </div>
  );
}

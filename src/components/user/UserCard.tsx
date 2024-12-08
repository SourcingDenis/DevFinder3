import { Card } from '@/components/ui/card';
import { GitHubUser } from '@/types/github';
import { SaveProfileButton } from './SaveProfileButton';
import { UserStats } from './UserStats';
import { UserEmails } from './UserEmails';

interface UserCardProps {
  user: GitHubUser;
  isSaved?: boolean;
  onRemoveSaved?: () => void;
}

export function UserCard({ user, isSaved, onRemoveSaved }: UserCardProps) {
  const languages = user.languages || {};
  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([lang]) => lang);

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{user.name || user.login}</h3>
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:underline"
              >
                @{user.login}
              </a>
            </div>
            <SaveProfileButton
              user={user}
              isSaved={isSaved}
              onRemoveSaved={onRemoveSaved}
            />
          </div>
          {user.bio && (
            <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
          )}
          <UserStats user={user} className="mt-4" />
          <UserEmails user={user} className="mt-4" />
          {topLanguages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Top Languages</h4>
              <div className="flex flex-wrap gap-2">
                {topLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-1 text-xs rounded-full bg-secondary"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
import type { GitHubUser } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserStats } from './UserStats';
import { LanguageBadge } from './LanguageBadge';
import { SaveProfileButton } from './SaveProfileButton';
import { UserEmails } from './UserEmails';
import { ExternalLink, MapPin, Building, Link as LinkIcon, Calendar, X } from 'lucide-react';

type UserCardProps = {
  user: GitHubUser;
  isSaved?: boolean;
  onRemove?: () => void;
  className?: string;
};

export function UserCard({ 
  user, 
  isSaved, 
  onRemove, 
  className 
}: UserCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="relative">
          {isSaved && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-8 w-8 sm:hidden hover:bg-destructive/10 hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="flex gap-6 relative">
            {/* Save button in top right corner */}
            <div className="absolute right-0 top-0">
              <SaveProfileButton
                user={user}
                isSaved={isSaved}
                onRemove={onRemove}
                className=""
              />
            </div>

            {/* Avatar section */}
            <div className="flex flex-col items-center gap-2">
              <img 
                src={user.avatar_url} 
                alt={`${user.login}'s avatar`}
                className="w-20 h-20 rounded-full ring-2 ring-border/50"
              />
            </div>

            {/* Main content section */}
            <div className="flex-1 min-w-0">
              {/* Header with name and badges */}
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {user.name || user.login}
                </h3>
                {user.hireable && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Hireable
                  </Badge>
                )}
              </div>

              {/* Username and join date */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <a 
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  @{user.login}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {user.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </span>
                )}
              </div>

              {/* Bio section */}
              {user.bio && (
                <p className="text-sm text-muted-foreground mb-4">
                  {user.bio}
                </p>
              )}

              {/* Stats section */}
              <UserStats user={user} />

              {/* Location and contact info */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
                {user.location && (
                  <span className="flex items-center gap-2 truncate col-span-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-primary/70" />
                    <span className="truncate">{user.location}</span>
                  </span>
                )}
                {user.company && (
                  <span className="flex items-center gap-2 truncate">
                    <Building className="h-4 w-4 flex-shrink-0 text-primary/70" />
                    <span className="truncate">{user.company}</span>
                  </span>
                )}
                {user.blog && (
                  <a 
                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary truncate"
                  >
                    <LinkIcon className="h-4 w-4 flex-shrink-0 text-primary/70" />
                    <span className="truncate">{user.blog}</span>
                  </a>
                )}
              </div>

              {/* Languages and emails section */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t">
                {user.languages && user.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {user.languages.map((lang) => (
                      <LanguageBadge key={lang} language={lang} />
                    ))}
                  </div>
                )}
                <UserEmails username={user.login} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
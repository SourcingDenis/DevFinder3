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
          <div className="flex gap-4">
            <img 
              src={user.avatar_url} 
              alt={`${user.login}'s avatar`}
              className="w-16 h-16 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              {/* Header section with name, username, and save button */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">
                      {user.name || user.login}
                    </h3>
                    {user.hireable && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800">
                        Hireable
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                </div>
                <SaveProfileButton
                  user={user}
                  isSaved={isSaved}
                  onRemove={onRemove}
                  className="flex-shrink-0"
                />
              </div>

              {/* Bio section */}
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {user.bio}
                </p>
              )}

              {/* Stats section */}
              <UserStats user={user} />

              {/* Metadata section */}
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-3">
                {user.company && (
                  <span className="flex items-center gap-1.5 truncate">
                    <Building className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{user.company}</span>
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{user.location}</span>
                  </span>
                )}
                {user.blog && (
                  <a 
                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-primary truncate"
                  >
                    <LinkIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{user.blog}</span>
                  </a>
                )}
              </div>

              {/* Languages and emails section */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {user.languages && user.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1 flex-1">
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
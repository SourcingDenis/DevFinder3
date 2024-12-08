import { useState, useEffect } from 'react';
import type { GitHubUser } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserStats } from './UserStats';
import { LanguageBadge } from './LanguageBadge';
import { SaveProfileButton } from './SaveProfileButton';
import { UserEmails } from './UserEmails';
import { ExternalLink, MapPin, Building, Link as LinkIcon, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: GitHubUser;
  isSaved?: boolean;
  onRemoveSaved?: () => void;
}

export function UserCard({ 
  user, 
  isSaved, 
  onRemoveSaved 
}: UserCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="relative">
          {isSaved && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 h-8 w-8 sm:hidden hover:bg-destructive/10 hover:text-destructive"
              onClick={onRemoveSaved}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <img 
              src={user.avatar_url} 
              alt={`${user.login}'s avatar`}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full self-center sm:self-start"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 text-center sm:text-left">
                  <h3 className="font-semibold text-lg truncate">
                    {user.name || user.login}
                  </h3>
                  <a 
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm justify-center sm:justify-start"
                  >
                    {user.login}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <SaveProfileButton
                  user={user}
                  isSaved={isSaved}
                  onRemoveSaved={onRemoveSaved}
                />
              </div>

              {user.bio && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 text-center sm:text-left">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-col sm:flex-row flex-wrap gap-y-2 gap-x-4 mt-4 text-sm text-muted-foreground items-center sm:items-start">
                {user.company && (
                  <span className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {user.company}
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </span>
                )}
                {user.blog && (
                  <a 
                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Website
                  </a>
                )}
                {user.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <UserEmails username={user.login} />
              </div>

              <div className="mt-4">
                <UserStats user={user} />
              </div>

              {user.languages && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.languages.map(lang => (
                    <LanguageBadge key={lang} language={lang} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
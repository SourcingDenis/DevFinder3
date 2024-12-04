import { useState } from 'react';
import type { GitHubUser } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserStats } from './UserStats';
import { LanguageBadge } from './LanguageBadge';
import { SaveProfileButton } from './SaveProfileButton';
import { EmailFinderButton } from './EmailFinderButton';
import { ExternalLink, MapPin, Building, Link as LinkIcon, Calendar, Mail, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: GitHubUser;
  isSaved?: boolean;
}

export function UserCard({ user, isSaved }: UserCardProps) {
  const [copied, setCopied] = useState(false);
  
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const copyEmail = async () => {
    if (!user.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="hover:bg-muted/50 transition-colors border">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <img
            src={user.avatar_url}
            alt={`${user.login}'s avatar`}
            className="w-16 h-16 rounded-full ring-2 ring-border"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-medium tracking-tight truncate text-foreground">
                    {user.name || user.login}
                  </h3>
                  {user.topLanguage && (
                    <LanguageBadge language={user.topLanguage} />
                  )}
                  {user.hireable && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Available for hire
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">@{user.login}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <EmailFinderButton 
                  username={user.login}
                  hasPublicEmail={!!user.email}
                />
                <SaveProfileButton user={user} isSaved={isSaved} />
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            {user.bio && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
            )}

            <UserStats
              followers={user.followers}
              following={user.following}
              publicRepos={user.public_repos}
            />

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.email && (
                <div className="flex items-center gap-1.5 email-glow rounded-full px-3 py-1.5 bg-primary/5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyEmail}
                    className={cn(
                      "h-6 w-6 p-0 hover:bg-transparent",
                      copied && "text-green-500"
                    )}
                    title={copied ? "Copied!" : "Copy email"}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}
              
              {user.company && (
                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  <span className="truncate">{user.company}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {joinDate}</span>
              </div>
              
              {user.blog && (
                <div className="flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <a
                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate max-w-[200px]"
                  >
                    {user.blog}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
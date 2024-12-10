import React, { forwardRef } from 'react';
import type { GitHubUser, SavedProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SaveProfileButton } from './SaveProfileButton';
import { UserStats } from './UserStats';
import { UserInfo } from './UserInfo';
import { ExternalLink, Calendar, X, Mail } from 'lucide-react';
import { findUserEmail } from '@/lib/github-api';
import { toast } from 'sonner';
import { EmailFinder } from './EmailFinder';

type UserCardBaseProps = {
  user: GitHubUser;
  onSave?: (profile: SavedProfile) => void;
  onRemove?: (githubUsername: string) => void;
  className?: string;
  listName?: string;
  isSaved?: boolean;
};

type UserCardProps = UserCardBaseProps & React.ComponentProps<typeof Card>;

export const UserCard = forwardRef<HTMLDivElement, UserCardProps & { isSaved?: boolean }>(({ 
  user, 
  onSave, 
  onRemove, 
  className = '', 
  listName,
  isSaved = false,
  ...props 
}, ref) => {
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [showEmailInput, setShowEmailInput] = React.useState(false);

  const handleFindEmail = async () => {
    setIsEmailLoading(true);
    try {
      const result = await findUserEmail(user.login);
      if (result.email) {
        toast.success(`Email found for ${user.login}`, {
          description: `Source: ${result.source}`
        });
      } else {
        // No email found, show input
        setShowEmailInput(true);
      }
    } catch (error) {
      toast.error('Error finding email', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  console.log('UserCard Props:', { user: user.login, listName, isSaved });

  return (
    <Card ref={ref} className={className} {...props}>
      <CardContent className="p-4">
        <div className="relative">
          {isSaved && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-8 w-8 sm:hidden hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRemove?.(user.login)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="flex gap-6 relative">
            {/* Save button in top right corner */}
            <div className="absolute right-0 top-0 flex items-center gap-2">
              {/* Email Finding Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleFindEmail}
                disabled={isEmailLoading}
                className="h-8 w-8"
              >
                {isEmailLoading ? (
                  <span className="loading-spinner h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </Button>

              <SaveProfileButton
                user={user}
                isSaved={isSaved}
                onSave={onSave}
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
                {listName && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {listName}
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

              {/* User Info section */}
              <UserInfo 
                login={user.login}
                bio={user.bio} 
                location={user.location} 
                profileUrl={user.html_url}
              />

              {/* User Stats section */}
              <UserStats user={user} />
            </div>
          </div>

          {/* Email Input Section */}
          {showEmailInput && (
            <div className="w-full mt-2">
              <EmailFinder 
                username={user.login}
                onClose={() => setShowEmailInput(false)}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
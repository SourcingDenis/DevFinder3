import React, { useState } from 'react';
import { Copy, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { findGitHubEmails } from '@/lib/github-email-finder';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface UserEmailsProps extends React.HTMLAttributes<HTMLDivElement> {
  username: string;
  emails?: string[];
}

export const UserEmails: React.FC<UserEmailsProps> = ({ 
  username, 
  className, 
  emails: propEmails, 
  ...props 
}) => {
  const [emails, setEmails] = useState<string[]>(propEmails || []);
  const [source, setSource] = useState<'github_commit' | 'github_profile' | 'generated' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscovered, setIsDiscovered] = useState(false);

  const discoverEmails = async () => {
    setIsLoading(true);
    try {
      const discoveredEmails = await findGitHubEmails(username);
      setEmails(discoveredEmails.emails);
      setSource(discoveredEmails.source);
      setIsDiscovered(true);
    } catch (error) {
      console.error('Email discovery failed:', error);
      toast({
        title: 'Email Discovery Failed',
        description: 'Unable to find emails for this user.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDiscovered) {
    return (
      <div className={cn("flex justify-center sm:justify-start", className)} {...props}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={discoverEmails}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner className="mr-2" /> : null}
          {isLoading ? 'Discovering...' : 'Discover Emails'}
        </Button>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className={cn("flex justify-center sm:justify-start", className)} {...props}>
        <p className="text-sm text-muted-foreground">No email found</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center sm:items-start gap-2", className)} {...props}>
      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
        {emails.map((email: string, index: number) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className={cn(
              "flex items-center gap-2",
              source === 'github_commit' && "bg-green-100 text-green-800",
              source === 'github_profile' && "bg-blue-100 text-blue-800",
              source === 'generated' && "bg-yellow-100 text-yellow-800"
            )}
          >
            <Mail className="h-3 w-3" />
            {email}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 p-0"
              onClick={() => {
                navigator.clipboard.writeText(email);
                toast({
                  title: 'Email Copied',
                  description: 'Email has been copied to clipboard.',
                });
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

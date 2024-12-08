import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { findGitHubEmails } from '@/lib/github-email-finder';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UserEmailsProps {
  username: string;
}

export function UserEmails({ username }: UserEmailsProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [source, setSource] = useState<'github_commit' | 'github_profile' | 'generated' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscovered, setIsDiscovered] = useState(false);

  const handleDiscoverEmail = async () => {
    if (isLoading || isDiscovered) return;
    
    setIsLoading(true);
    try {
      const result = await findGitHubEmails(username);
      setEmails(result.emails);
      setSource(result.source);
      setIsDiscovered(true);
    } catch (error) {
      console.error('Error discovering emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDiscovered) {
    return (
      <div className="flex justify-center sm:justify-start">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2" 
          onClick={handleDiscoverEmail}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Discover Email
        </Button>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex justify-center sm:justify-start">
        <p className="text-sm text-muted-foreground">No email found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
        {emails.map((email, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className={cn(
              "flex items-center gap-1",
              source === 'github_commit' && "bg-green-100 text-green-800",
              source === 'github_profile' && "bg-blue-100 text-blue-800",
              source === 'generated' && "bg-yellow-100 text-yellow-800"
            )}
          >
            <Mail className="h-3 w-3" />
            {email}
          </Badge>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Mail, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { findUserEmail } from '@/lib/github-api';
import { cn } from '@/lib/utils';

interface EmailFinderButtonProps {
  username: string;
  hasPublicEmail?: boolean;
}

export function EmailFinderButton({ username, hasPublicEmail }: EmailFinderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [emailSearched, setEmailSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFindEmail = async () => {
    setIsLoading(true);
    setEmailSearched(true);
    try {
      const email = await findUserEmail(username);
      setFoundEmail(email);
    } catch (error) {
      console.error('Error finding email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!foundEmail) return;
    try {
      await navigator.clipboard.writeText(foundEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (hasPublicEmail) return null;

  if (emailSearched && !isLoading) {
    if (foundEmail) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{foundEmail}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className={cn(
              "h-6 w-6 p-0 hover:bg-transparent",
              copied && "text-green-500"
            )}
            title={copied ? "Copied!" : "Copy email"}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      );
    }
    
    return (
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <Mail className="h-4 w-4" />
        No email found
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleFindEmail}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      {isLoading ? 'Finding email...' : 'Find email'}
    </Button>
  );
}
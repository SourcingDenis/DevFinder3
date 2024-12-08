import { GitHubUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailFinderButton } from './user/EmailFinderButton';

interface UserCardProps {
  user: GitHubUser;
}

interface EnrichedEmail {
  id?: string;
  github_username: string;
  email: string;
  enriched_by?: string;
  enriched_at?: string;
  source: 'github_commit' | 'github_profile' | 'manual' | 'generated';
}

export function UserCard({ user }: UserCardProps) {
  const [enrichedEmails, setEnrichedEmails] = useState<EnrichedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchEnrichedEmails = async () => {
      if (!user.login) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('enriched_emails')
          .select('*')
          .eq('github_username', user.login);

        if (error) {
          console.error('Error fetching enriched emails:', error);
          return;
        }

        if (isMounted && data) {
          setEnrichedEmails(data);
        }
      } catch (error) {
        console.error('Error in fetchEnrichedEmails:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEnrichedEmails();

    // Subscribe to changes
    const subscription = supabase
      .channel('enriched_emails_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enriched_emails',
          filter: `github_username=eq.${user.login}`,
        },
        () => {
          if (!isMounted) return;
          fetchEnrichedEmails();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [user.login]);

  const getEmailBadgeStyle = (source: EnrichedEmail['source'] | 'public') => {
    switch (source) {
      case 'public':
        return 'bg-green-500/10 text-green-500 ring-green-500/20';
      case 'github_profile':
      case 'github_commit':
        return 'bg-blue-500/10 text-blue-500 ring-blue-500/20';
      case 'generated':
        return 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20';
      case 'manual':
        return 'bg-purple-500/10 text-purple-500 ring-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 ring-gray-500/20';
    }
  };

  const getEmailLabel = (source: EnrichedEmail['source'] | 'public') => {
    switch (source) {
      case 'public':
        return 'Public';
      case 'github_profile':
        return 'GitHub Profile';
      case 'github_commit':
        return 'GitHub Commit';
      case 'generated':
        return 'Generated';
      case 'manual':
        return 'Manual';
      default:
        return 'Unknown';
    }
  };

  const handleEmailFound = (email: string, source: string) => {
    const newEmail: EnrichedEmail = {
      github_username: user.login,
      email,
      source: source as EnrichedEmail['source'],
      enriched_at: new Date().toISOString(),
    };

    setEnrichedEmails(prev => {
      const exists = prev.some(e => e.email === email);
      if (exists) {
        return prev;
      }
      return [...prev, newEmail];
    });
  };

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg">
      <div className="flex items-start gap-4">
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-medium">
              {user.name || user.login}
            </h3>
            <div className="flex items-center gap-2">
              {user.language && (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                  {user.language}
                </span>
              )}
              {user.available_for_hire && (
                <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                  Available for hire
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">@{user.login}</p>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span>{user.followers} followers</span>
            </span>
            <span className="flex items-center gap-1">
              <span>{user.following} following</span>
            </span>
            <span className="flex items-center gap-1">
              <span>{user.public_repos} repos</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
            {user.location && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <span>📍</span> {user.location}
              </span>
            )}
            {user.created_at && (
              <span className="flex items-center gap-1 text-muted-foreground">
                Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
            
            {/* Display public email if available */}
            {user.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getEmailBadgeStyle('public')}`}>
                  {getEmailLabel('public')}
                </span>
              </div>
            )}
            
            {/* Display enriched emails */}
            {enrichedEmails.map((enrichedEmail) => (
              <div key={enrichedEmail.id || enrichedEmail.email} className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{enrichedEmail.email}</span>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getEmailBadgeStyle(enrichedEmail.source)}`}>
                  {getEmailLabel(enrichedEmail.source)}
                </span>
              </div>
            ))}

            {/* Show EmailFinderButton if no public email */}
            {!user.email && (
              <EmailFinderButton
                username={user.login}
                hasPublicEmail={!!user.email}
                onEmailFound={handleEmailFound}
              />
            )}
          </div>

          {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
        </div>
      </div>
    </div>
  );
}
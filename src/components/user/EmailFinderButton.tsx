import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { findUserEmail } from '@/lib/github-api';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface EmailFinderButtonProps {
  username: string;
  hasPublicEmail: boolean;
  onEmailFound: (email: string, source: string) => void;
}

export function EmailFinderButton({ username, hasPublicEmail, onEmailFound }: EmailFinderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFindEmail = async () => {
    if (hasPublicEmail) return;
    
    setIsLoading(true);
    try {
      console.log('DEBUG: Starting email find process for', username);
      
      // Get the current user first
      const { data: { user } } = await supabase.auth.getUser();
      console.log('DEBUG: Current user:', user?.id);
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save emails.",
          variant: "destructive",
        });
        return;
      }

      // Generate the email first
      const generatedEmail = `${username}@gmail.com`;
      console.log('DEBUG: Generated email:', generatedEmail);
      
      // Try to find a real email first
      console.log('DEBUG: Attempting to find GitHub email');
      try {
        const result = await findUserEmail(username);
        console.log('DEBUG: GitHub email result:', result);
        
        if (result.email) {
          const source = result.source === 'stored' ? 'github_profile' : 'github_commit';
          
          const { error: realError } = await supabase
            .from('enriched_emails')
            .insert({
              github_username: username,
              email: result.email,
              enriched_by: user.id,
              source
            });

          if (realError) {
            console.error('DEBUG: Error saving real email:', realError);
            throw realError;
          } else {
            console.log('DEBUG: Successfully saved real email');
            onEmailFound(result.email, source);
          }
        }
      } catch (error) {
        console.log('DEBUG: GitHub email enrichment failed, using generated email');
        // If GitHub email finding fails or no email found, save the generated email
        const { error: genError } = await supabase
          .from('enriched_emails')
          .insert({
            github_username: username,
            email: generatedEmail,
            enriched_by: user.id,
            source: 'generated'
          });

        if (genError) {
          console.error('DEBUG: Error saving generated email:', genError);
          throw genError;
        } else {
          console.log('DEBUG: Successfully saved generated email');
          onEmailFound(generatedEmail, 'generated');
        }
      }
      
    } catch (error) {
      console.error('DEBUG: Final error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleFindEmail}
      disabled={isLoading || hasPublicEmail}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      Find Email
    </Button>
  );
}

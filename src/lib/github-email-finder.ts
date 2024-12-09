import { supabase } from './supabase';
import { discoverGitHubEmails } from '@/lib/api-utils';

interface EmailFinderResult {
  emails: string[];
  source: 'github_commit' | 'github_profile' | 'generated';
}

export async function findGitHubEmails(username: string): Promise<EmailFinderResult> {
  // First check if we already have this user's email in our database
  const { data: existingEmails } = await supabase
    .from('enriched_emails')
    .select('email, source')
    .eq('github_username', username)
    .order('source');

  if (existingEmails && existingEmails.length > 0) {
    return {
      emails: existingEmails.map(e => e.email),
      source: existingEmails[0].source as 'github_commit' | 'github_profile' | 'generated'
    };
  }

  // If not found, try to discover from GitHub
  const discoveredEmails: EmailFinderResult = await discoverGitHubEmails(username);
  
  if (discoveredEmails.emails.length > 0) {
    // Get current user's ID
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('No authenticated user found');
      return { emails: discoveredEmails.emails, source: 'github_commit' };
    }

    // Store discovered emails
    const { error } = await supabase.from('enriched_emails').insert(
      discoveredEmails.emails.map(email => ({
        github_username: username,
        email,
        source: 'github_commit',
        enriched_by: currentUser.id
      }))
    );

    if (error) console.error('Error storing emails:', error);

    return { emails: discoveredEmails.emails, source: 'github_commit' };
  }

  // If no emails found, generate one and store it
  const generatedEmail = `${username}@gmail.com`;
  const generatedEmails = [generatedEmail];
  
  // Get current user's ID
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  if (currentUser?.id) {
    const { error } = await supabase.from('enriched_emails').insert({
      github_username: username,
      email: generatedEmail,
      source: 'generated',
      enriched_by: currentUser.id
    });

    if (error) console.error('Error storing generated email:', error);
  }

  return { emails: generatedEmails, source: 'generated' };
}

export { discoverGitHubEmails };

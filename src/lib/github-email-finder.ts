import { supabase } from './supabase';

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
  const emails = await discoverGitHubEmails(username);
  
  if (emails.length > 0) {
    // Get current user's ID
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('No authenticated user found');
      return { emails, source: 'github_commit' };
    }

    // Store discovered emails
    const { error } = await supabase.from('enriched_emails').insert(
      emails.map(email => ({
        github_username: username,
        email,
        source: 'github_commit',
        enriched_by: currentUser.id
      }))
    );

    if (error) console.error('Error storing emails:', error);

    return { emails, source: 'github_commit' };
  }

  // If no emails found, generate one and store it
  const generatedEmail = `${username}@gmail.com`;
  
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

  return { emails: [generatedEmail], source: 'generated' };
}

async function discoverGitHubEmails(username: string): Promise<string[]> {
  try {
    // First try to get emails from user's repositories
    const emails = new Set<string>();
    
    // Get repositories page
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=5`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevFinder'
      }
    });
    
    if (!reposResponse.ok) {
      throw new Error(`Failed to fetch repos: ${reposResponse.statusText}`);
    }
    
    const repos = await reposResponse.json();
    
    // For each repository, get commit patches
    for (const repo of repos) {
      const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=3`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DevFinder'
        }
      });
      
      if (!commitsResponse.ok) {
        console.warn(`Failed to fetch commits for ${repo.name}: ${commitsResponse.statusText}`);
        continue;
      }
      
      const commits = await commitsResponse.json();
      
      for (const commit of commits) {
        if (commit.commit?.author?.email && !commit.commit.author.email.includes('users.noreply.github')) {
          emails.add(commit.commit.author.email);
        }
      }
    }

    return Array.from(emails);
  } catch (error) {
    console.error('Error discovering emails:', error);
    return [];
  }
}

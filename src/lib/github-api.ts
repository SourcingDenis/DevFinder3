import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { UserSearchParams, GitHubUser, SearchResponse } from '@/types';
import { supabase } from './supabase';

// Type guard for error objects
function isErrorWithMessage(error: unknown): error is Error {
  return (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as Error).message === 'string'
  );
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

const getGithubApi = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error('Failed to get session');
    }

    if (!session) {
      throw new Error('No active session');
    }

    if (!session.provider_token) {
      // Attempt to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session?.provider_token) {
        throw new Error('Failed to refresh GitHub authentication token');
      }

      // Update session with new token
      session.provider_token = refreshData.session.provider_token;
    }

    const api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Add response interceptor for automatic token refresh
    api.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh the session
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session?.provider_token) {
              throw new Error('Failed to refresh authentication');
            }

            // Update the authorization header with new token
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${refreshData.session.provider_token}`;
            }
            
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Only sign out if refresh token is expired
            if (isAxiosError(refreshError) && refreshError.response?.status === 401) {
              await supabase.auth.signOut();
              window.location.href = '/';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return api;
  } catch (error) {
    console.error('Error creating GitHub API client:', error);
    throw error;
  }
};

interface EmailResult {
  email: string | null;
  source: string | null;
  confidence: number;
}

interface StoredEmail {
  id: number;
  username: string;
  email: string;
  source: string;
  confidence: number;
  version: number;
  created_at: string;
  updated_at: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function searchUsers(params: UserSearchParams): Promise<SearchResponse<GitHubUser>> {
  try {
    const githubApi = await getGithubApi();
    
    // Construct the search query
    let q = params.query || '';
    
    // Add language filter if specified
    if (params.language) {
      q += ` language:${params.language}`;
    }

    // Add location filters if specified
    if (params.locations && params.locations.length > 0) {
      q += ` ${params.locations.map(loc => `location:${loc}`).join(' ')}`;
    }

    // Add followers range if specified
    if (params.followersMin) {
      q += ` followers:>=${params.followersMin}`;
    }
    if (params.followersMax) {
      q += ` followers:<=${params.followersMax}`;
    }

    // Add repositories range if specified
    if (params.reposMin) {
      q += ` repos:>=${params.reposMin}`;
    }
    if (params.reposMax) {
      q += ` repos:<=${params.reposMax}`;
    }

    // Add hireable filter
    if (params.hireable) {
      q += ' is:hireable';
    }

    try {
      const response = await githubApi.get('/search/users', {
        params: {
          q,
          sort: params.sort || 'best-match',
          order: params.order || 'desc',
          per_page: params.per_page || 30,
          page: params.page || 1
        }
      });

      // Fetch detailed information for each user
      const users = await Promise.all(
        response.data.items.map(async (user: any) => {
          try {
            // Fetch detailed user info
            const userDetailsResponse = await githubApi.get(`/users/${user.login}`);
            const userDetails = userDetailsResponse.data;

            // Fetch user's top language
            const topLanguage = await fetchUserTopLanguage(user.login);
            
            // Fetch user's email
            const { email, source } = await findUserEmail(user.login);
            
            return {
              ...userDetails,
              topLanguage,
              email,
              source,
              score: user.score
            };
          } catch (error) {
            console.error(`Error fetching details for user ${user.login}:`, error);
            return {
              login: user.login,
              id: user.id,
              avatar_url: user.avatar_url,
              score: user.score
            };
          }
        })
      );

      // Check for rate limit headers
      const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
      const rateLimitReset = response.headers['x-ratelimit-reset'];

      if (rateLimitRemaining && Number(rateLimitRemaining) < 10) {
        console.warn(`GitHub API rate limit is low. Remaining: ${rateLimitRemaining}. Resets at: ${new Date(Number(rateLimitReset) * 1000)}`);
      }

      return {
        items: users,
        total_count: response.data.total_count,
        incomplete_results: response.data.incomplete_results
      };
    } catch (apiError) {
      // Type-safe error handling
      if (isAxiosError(apiError)) {
        if (apiError.response) {
          console.error('GitHub API Error:', {
            status: apiError.response.status,
            data: apiError.response.data,
            headers: apiError.response.headers
          });

          switch (apiError.response.status) {
            case 403:
              throw new Error('GitHub API rate limit exceeded. Please try again later.');
            case 422:
              throw new Error('Invalid search query. Please check your search parameters.');
            case 503:
              throw new Error('GitHub service is temporarily unavailable. Please try again later.');
            default:
              throw new Error(`GitHub API request failed: ${apiError.message}`);
          }
        } else if (apiError.request) {
          console.error('No response received:', apiError.request);
          throw new Error('No response from GitHub. Check your internet connection.');
        }
      }

      // Fallback for any other unexpected errors
      const errorMessage = isErrorWithMessage(apiError) 
        ? apiError.message 
        : 'Unexpected error setting up GitHub API request';
      
      console.error('Error setting up GitHub API request:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    const errorMessage = isErrorWithMessage(error) 
      ? error.message 
      : 'Unexpected error in searchUsers';
    
    console.error('Unexpected error in searchUsers:', errorMessage);
    throw new Error(errorMessage);
  }
}

export async function findUserEmail(username: string): Promise<{ email: string | null; source: string | null }> {
  try {
    // First, check if we have a stored email for this user
    const { data: storedEmails } = await supabase
      .from('enriched_emails')
      .select('email, source')
      .eq('github_username', username)
      .order('created_at', { ascending: false })
      .limit(1);

    if (storedEmails && storedEmails.length > 0) {
      return {
        email: storedEmails[0].email,
        source: storedEmails[0].source
      };
    }

    const githubApi = await getGithubApi();
    
    // Initialize potential email sources
    const emailSources: Promise<EmailResult>[] = [
      // Check user profile
      githubApi.get(`/users/${username}`).then(response => ({
        email: response.data.email,
        source: 'github_profile',
        confidence: 1.0
      })).catch(() => ({
        email: null,
        source: null,
        confidence: 0
      })),
      
      // Check public events
      githubApi.get(`/users/${username}/events/public`).then(response => {
        const commits = response.data
          .filter(event => event.payload?.commits)
          .flatMap(event => event.payload.commits)
          .filter(commit => commit?.author?.email);

        const emailFrequency = commits.reduce((acc: Record<string, number>, commit: any) => {
          const email = commit.author.email;
          if (!email.includes('noreply.github.com')) {
            acc[email] = (acc[email] || 0) + 1;
          }
          return acc;
        }, {});

        const [mostFrequentEmail] = Object.entries(emailFrequency)
          .sort(([, a], [, b]) => b - a);

        return mostFrequentEmail ? {
          email: mostFrequentEmail[0],
          source: 'public_events_commit',
          confidence: mostFrequentEmail[1] / commits.length
        } : {
          email: null,
          source: null,
          confidence: 0
        };
      }).catch(() => ({
        email: null,
        source: null,
        confidence: 0
      }))
    ];

    // Wait for all email sources to resolve
    const results = await Promise.all(emailSources);
    
    // Sort by confidence and pick the best result
    const bestResult = results
      .filter(result => result.email !== null)
      .sort((a, b) => b.confidence - a.confidence)[0];

    if (bestResult?.email) {
      // Store the found email
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.id) {
        await supabase.from('enriched_emails').insert({
          github_username: username,
          email: bestResult.email,
          source: bestResult.source,
          enriched_by: currentUser.id,
          confidence: bestResult.confidence
        });
      }

      return {
        email: bestResult.email,
        source: bestResult.source
      };
    }

    return { email: null, source: null };
  } catch (error) {
    const errorMessage = isErrorWithMessage(error) 
      ? error.message 
      : 'Unexpected error in findUserEmail';
    
    console.error('Unexpected error in findUserEmail:', {
      username,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    throw new Error(errorMessage);
  }
}

export async function fetchAllUsers(params: Omit<UserSearchParams, 'page'>): Promise<GitHubUser[]> {
  try {
    const allUsers: GitHubUser[] = [];
    let page = 1;
    let hasMoreResults = true;

    while (hasMoreResults) {
      try {
        const searchResult = await searchUsers({ ...params, page });
        
        if (searchResult.items.length === 0) {
          hasMoreResults = false;
          break;
        }

        allUsers.push(...searchResult.items);

        // Break if we've reached the total count or the last page
        if (allUsers.length >= searchResult.total_count || searchResult.items.length < (params.per_page || 30)) {
          hasMoreResults = false;
        }

        page++;
      } catch (pageError) {
        const errorMessage = isErrorWithMessage(pageError) 
          ? pageError.message 
          : 'Unknown error fetching page of users';
        
        console.error(`Error fetching page ${page}:`, errorMessage);
        
        // Decide whether to continue or break based on the error
        if (isAxiosError(pageError) && pageError.response?.status === 403) {
          // Rate limit or authentication error
          console.warn('Rate limit or authentication error. Stopping further requests.');
          break;
        }

        // Increment page to avoid infinite loop
        page++;
      }
    }

    return allUsers;
  } catch (error) {
    const errorMessage = isErrorWithMessage(error) 
      ? error.message 
      : 'Unexpected error in fetchAllUsers';
    
    console.error('Unexpected error in fetchAllUsers:', errorMessage);
    throw new Error(errorMessage);
  }
}

export async function storeUserEmail(
  username: string, 
  email: string, 
  source: string, 
  confidence: number = 1.0
): Promise<void> {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      // Input validation
      if (!username?.trim() || !email?.trim() || !source?.trim()) {
        throw new Error('Invalid input: username, email, and source are required');
      }

      // Email validation with RFC 5322 standard
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Source validation
      const validSources = ['public_events_commit', 'github_profile', 'manual_input'];
      if (!validSources.includes(source)) {
        throw new Error(`Invalid email source. Must be one of: ${validSources.join(', ')}`);
      }

      // Confidence validation
      if (confidence < 0 || confidence > 1) {
        throw new Error('Confidence must be between 0 and 1');
      }

      // Start transaction
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.id) {
        throw new Error('User must be authenticated to store emails');
      }

      // Fetch existing record with FOR UPDATE lock
      const { data: existingEmails, error: selectError } = await supabase
        .from('enriched_emails')
        .select('*')
        .eq('github_username', username)
        .order('confidence', { ascending: false })
        .limit(1);

      if (selectError) {
        throw selectError;
      }

      const existingEmail = existingEmails?.[0] as StoredEmail | undefined;
      const now = new Date().toISOString();

      if (existingEmail) {
        // Only update if new email has higher confidence or is more recent
        if (confidence > (existingEmail.confidence || 0)) {
          const { error: updateError } = await supabase
            .from('enriched_emails')
            .update({ 
              email,
              source,
              confidence,
              enriched_by: currentUser.id,
              updated_at: now,
              version: existingEmail.version + 1
            })
            .eq('id', existingEmail.id)
            .eq('version', existingEmail.version); // Optimistic locking

          if (updateError) {
            if (updateError.code === '23505') { // Unique violation
              continue; // Retry
            }
            throw updateError;
          }
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('enriched_emails')
          .insert({ 
            github_username: username,
            email,
            source,
            confidence,
            enriched_by: currentUser.id,
            created_at: now,
            updated_at: now,
            version: 1
          });

        if (insertError) {
          if (insertError.code === '23505') { // Unique violation
            continue; // Retry
          }
          throw insertError;
        }
      }

      // Successfully stored email
      return;
    } catch (error) {
      retries++;
      
      const errorMessage = isErrorWithMessage(error) 
        ? error.message 
        : 'Unexpected error in storeUserEmail';
      
      if (retries === MAX_RETRIES) {
        console.error('Failed to store user email after max retries:', {
          username,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw new Error(`Failed to store email after ${MAX_RETRIES} attempts: ${errorMessage}`);
      }
      
      // Wait before retrying
      await sleep(RETRY_DELAY * retries);
    }
  }
}

export async function fetchUserTopLanguage(username: string): Promise<string | null> {
  try {
    const githubApi = await getGithubApi();
    
    // Fetch user's repositories
    const response = await githubApi.get(`/users/${username}/repos`, {
      params: {
        sort: 'updated',
        per_page: 100, // Limit to most recent 100 repos for performance
        type: 'owner' // Only include repos owned by the user
      }
    });

    if (!response.data || response.data.length === 0) {
      return null;
    }

    // Create a map to store language frequencies
    const languageFrequency: { [key: string]: number } = {};
    
    // Count the languages
    for (const repo of response.data) {
      if (repo.language) {
        languageFrequency[repo.language] = (languageFrequency[repo.language] || 0) + 1;
      }
    }

    // Find the most frequent language
    let topLanguage = null;
    let maxCount = 0;

    for (const [language, count] of Object.entries(languageFrequency)) {
      if (count > maxCount) {
        maxCount = count;
        topLanguage = language;
      }
    }

    return topLanguage;
  } catch (error) {
    console.error('Error fetching user top language:', error);
    return null;
  }
}
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { UserSearchParams, GitHubUser, SearchResponse } from '@/types';
import { authService } from './auth-service';

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

const GITHUB_API_BASE = 'https://api.github.com';

// Cache for rate limit info
let rateLimitCache = {
  remaining: 60,
  reset: 0,
  lastChecked: 0
};

// Implement request queue to handle rate limiting
const requestQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      try {
        await request();
      } catch (error) {
        console.error('Error processing queued request:', error);
      }
    }
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  isProcessingQueue = false;
}

const getGithubApi = async () => {
  try {
    const token = await authService.getValidToken();

    const api = axios.create({
      baseURL: GITHUB_API_BASE,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Add response interceptor for automatic token refresh
    api.interceptors.response.use(
      response => {
        // Update rate limit info
        const remaining = response.headers['x-ratelimit-remaining'];
        const reset = response.headers['x-ratelimit-reset'];
        if (remaining && reset) {
          rateLimitCache = {
            remaining: parseInt(remaining),
            reset: parseInt(reset) * 1000, // Convert to milliseconds
            lastChecked: Date.now()
          };
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const token = await authService.getValidToken();
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`
            };
            return axios(originalRequest);
          } catch (refreshError) {
            // Token refresh failed, throw error to be handled by the component
            throw new Error('Authentication failed. Please sign in again.');
          }
        }

        // Handle rate limit errors
        if (error.response?.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
          const resetTime = new Date(parseInt(error.response.headers['x-ratelimit-reset']) * 1000);
          throw new Error(`GitHub API rate limit exceeded. Reset at ${resetTime.toLocaleTimeString()}`);
        }

        throw error;
      }
    );

    return api;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`GitHub API initialization failed: ${error.message}`);
    }
    throw new Error('GitHub API initialization failed');
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

interface GitHubEvent {
  payload?: {
    commits?: Array<{
      author?: {
        email?: string;
      };
    }>;
  };
}

interface EmailFrequency {
  [email: string]: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function searchUsers(params: UserSearchParams): Promise<SearchResponse<GitHubUser>> {
  const searchParams = new URLSearchParams();
  let queryString = params.query;

  // Optimize query string construction
  if (params.language) {
    queryString += ` language:${params.language}`;
  }
  if (params.locations?.length) {
    queryString += ` ${params.locations.map(loc => `location:${loc}`).join(' ')}`;
  }
  if (params.hireable) {
    queryString += ' is:hireable';
  }

  searchParams.set('q', queryString.trim());
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);
  if (params.per_page) searchParams.set('per_page', params.per_page.toString());
  if (params.page) searchParams.set('page', params.page.toString());

  // Check rate limit before making request
  if (rateLimitCache.remaining <= 0) {
    const now = Date.now() / 1000;
    if (now < rateLimitCache.reset) {
      const waitTime = (rateLimitCache.reset - now) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return new Promise((resolve, reject) => {
    const request = async () => {
      try {
        const githubApi = await getGithubApi();
        const response = await githubApi.get('/search/users', {
          params: searchParams
        });

        // Update rate limit info
        rateLimitCache = {
          remaining: Number(response.headers['x-ratelimit-remaining']) || 0,
          reset: Number(response.headers['x-ratelimit-reset']) || 0,
          lastChecked: Date.now()
        };

        if (response.status !== 200) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = response.data;

        // Fetch detailed information for each user
        const users = await Promise.all(
          data.items.map(async (user: any) => {
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

        resolve({
          items: users,
          total_count: data.total_count,
          incomplete_results: data.incomplete_results
        });
      } catch (error) {
        reject(error);
      }
    };

    requestQueue.push(request);
    processQueue();
  });
}

export async function findUserEmail(username: string): Promise<EmailResult> {
  try {
    // First, check if we have a stored email for this user
    const { data: storedEmails } = await authService.supabase
      .from('enriched_emails')
      .select('email, source, confidence')
      .eq('github_username', username)
      .order('created_at', { ascending: false })
      .limit(1);

    if (storedEmails && storedEmails.length > 0) {
      return {
        email: storedEmails[0].email,
        source: storedEmails[0].source,
        confidence: storedEmails[0].confidence
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
        const commits = (response.data as GitHubEvent[])
          .filter((event: GitHubEvent) => event.payload?.commits)
          .flatMap((event: GitHubEvent) => event.payload?.commits || [])
          .filter((commit) => commit?.author?.email);

        const emailFrequency = commits.reduce<EmailFrequency>((acc, commit) => {
          const email = commit.author?.email;
          if (email && !email.includes('noreply.github.com')) {
            acc[email] = (acc[email] || 0) + 1;
          }
          return acc;
        }, {});

        const entries = Object.entries(emailFrequency);
        const [mostFrequentEmail] = entries.length > 0 
          ? entries.sort(([, a], [, b]) => b - a)
          : [null];

        return mostFrequentEmail ? {
          email: mostFrequentEmail[0],
          source: 'public_events_commit',
          confidence: commits.length > 0 ? mostFrequentEmail[1] / commits.length : 0
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
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0] || {
        email: null,
        source: null,
        confidence: 0
      };

    return bestResult;
  } catch (error) {
    console.error('Error in findUserEmail:', error);
    return {
      email: null,
      source: null,
      confidence: 0
    };
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
      const { data: { user: currentUser } } = await authService.supabase.auth.getUser();
      if (!currentUser?.id) {
        throw new Error('User must be authenticated to store emails');
      }

      // Fetch existing record with FOR UPDATE lock
      const { data: existingEmails, error: selectError } = await authService.supabase
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
          const { error: updateError } = await authService.supabase
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
        const { error: insertError } = await authService.supabase
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
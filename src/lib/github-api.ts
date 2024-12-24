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

interface RateLimitInfo {
  remaining: number;
  reset: number;
  lastChecked: number;
  total: number;
}

let rateLimitCache: RateLimitInfo = {
  remaining: 60,
  reset: 0,
  lastChecked: 0,
  total: 60
};

function formatRateLimitError(resetTime: number, currentRemaining: number, total: number): string {
  const resetDate = new Date(resetTime * 1000);
  const percentRemaining = Math.round((currentRemaining / total) * 100);
  const resetTimeString = resetDate.toLocaleTimeString();
  
  if (currentRemaining === 0) {
    return `GitHub API rate limit exceeded. Reset at ${resetTimeString}`;
  }
  
  return `GitHub API rate limit warning: ${percentRemaining}% remaining. Reset at ${resetTimeString}`;
}

async function checkRateLimit(): Promise<RateLimitInfo> {
  try {
    const githubApi = await getGithubApi();
    const response = await githubApi.get('/rate_limit');
    const { resources } = response.data;
    
    rateLimitCache = {
      remaining: resources.search.remaining,
      reset: resources.search.reset,
      lastChecked: Date.now(),
      total: resources.search.limit
    };

    // Emit warning if rate limit is getting low
    if (rateLimitCache.remaining < rateLimitCache.total * 0.2) {
      console.warn(formatRateLimitError(
        rateLimitCache.reset,
        rateLimitCache.remaining,
        rateLimitCache.total
      ));
    }

    return rateLimitCache;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    throw error;
  }
}

interface GitHubToken {
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
}

async function getStoredToken(): Promise<GitHubToken | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: tokens, error } = await supabase
      .from('user_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', session.user.id)
      .eq('provider', 'github')
      .single();

    if (error || !tokens) {
      console.error('Error fetching stored token:', error);
      return null;
    }

    return tokens;
  } catch (error) {
    console.error('Error in getStoredToken:', error);
    return null;
  }
}

const getGithubApi = async () => {
  try {
    console.log('Getting GitHub session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to get session');
    }

    if (!session?.user) {
      console.error('No session found');
      throw new Error('Please sign in with GitHub to use the search functionality');
    }

    console.log('Session found, checking provider token...');
    let token = session.provider_token;
    let tokenExpiration: Date | null = null;

    if (!token) {
      console.log('No provider token, checking stored token...');
      const storedToken = await getStoredToken();
      
      if (storedToken) {
        console.log('Found stored token, checking expiration...');
        tokenExpiration = new Date(storedToken.expires_at);
        
        if (tokenExpiration > new Date()) {
          console.log('Using stored token');
          token = storedToken.access_token;
        }
      }
      
      if (!token || (tokenExpiration && tokenExpiration <= new Date())) {
        console.log('Token expired or not found, refreshing session...');
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Session refresh error:', refreshError);
            throw new Error('Failed to refresh session. Please sign in again.');
          }

          if (!refreshData.session) {
            console.error('No session after refresh');
            throw new Error('Session refresh failed. Please sign in again.');
          }

          if (!refreshData.session.provider_token) {
            console.error('No provider token after refresh');
            // Trigger re-authentication
            const { error: signInError } = await supabase.auth.signInWithOAuth({
              provider: 'github',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: 'read:user read:email'
              }
            });

            if (signInError) {
              throw new Error('Failed to re-authenticate with GitHub. Please sign in again.');
            }
            
            throw new Error('GitHub authentication required. Please complete the sign-in process.');
          }

          token = refreshData.session.provider_token;
          
          // Store the refreshed token
          const expiresAt = new Date(Date.now() + 55 * 60 * 1000); // 55 minutes from now
          await supabase
            .from('user_tokens')
            .upsert({
              user_id: session.user.id,
              provider: 'github',
              access_token: token,
              refresh_token: refreshData.session.provider_refresh_token || null,
              expires_at: expiresAt.toISOString(),
            }, {
              onConflict: 'user_id,provider'
            });
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Failed to refresh GitHub token. Please sign in again.');
        }
      }
    }

    if (!token) {
      throw new Error('Unable to obtain GitHub token');
    }

    console.log('Creating GitHub API client...');
    const api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Add response interceptor for rate limit handling
    api.interceptors.response.use(
      response => {
        // Update rate limit info
        const remaining = parseInt(response.headers['x-ratelimit-remaining'] || '60');
        const reset = parseInt(response.headers['x-ratelimit-reset'] || '0') * 1000;
        rateLimitCache = {
          remaining,
          reset,
          lastChecked: Date.now(),
          total: parseInt(response.headers['x-ratelimit-limit'] || '60')
        };
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, try to refresh
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session?.provider_token) {
              throw new Error('Failed to refresh GitHub token');
            }

            // Update stored token
            await supabase
              .from('user_tokens')
              .upsert({
                user_id: refreshData.session.user.id,
                provider: 'github',
                access_token: refreshData.session.provider_token,
                refresh_token: refreshData.session.provider_refresh_token || null,
                expires_at: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
              }, {
                onConflict: 'user_id,provider'
              });

            // Retry the request with new token
            const originalRequest = error.config as AxiosRequestConfig;
            if (!originalRequest) {
              throw new Error('No request config available for retry');
            }

            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${refreshData.session.provider_token}`;
            }
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh fails, try stored token as last resort
            const storedToken = await getStoredToken();
            if (storedToken && new Date(storedToken.expires_at) > new Date()) {
              const originalRequest = error.config as AxiosRequestConfig;
              if (!originalRequest) {
                throw new Error('No request config available for retry');
              }

              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${storedToken.access_token}`;
              }
              return axios(originalRequest);
            }
            
            // If all retries fail, throw authentication error
            throw new Error('GitHub authentication required. Please sign in again.');
          }
        }
        throw error;
      }
    );

    return api;
  } catch (error) {
    console.error('Error in getGithubApi:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to initialize GitHub API client');
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

// Function to get total count and basic user info
export async function getTotalCount(params: Omit<UserSearchParams, 'page'>): Promise<{ total_count: number, items: any[] }> {
  const searchParams = new URLSearchParams();
  let queryString = params.query;

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
  searchParams.set('per_page', '1'); // We only need count, so minimize data transfer

  const githubApi = await getGithubApi();
  const response = await githubApi.get('/search/users', { params: searchParams });
  
  return {
    total_count: response.data.total_count,
    items: response.data.items
  };
}

// Function to fetch detailed data for a specific page
export async function fetchPageDetails(params: UserSearchParams): Promise<SearchResponse<GitHubUser>> {
  console.log('Fetching details for page:', params.page);
  const searchParams = new URLSearchParams();
  let queryString = params.query;

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
  searchParams.set('per_page', '30');
  if (params.page) searchParams.set('page', params.page.toString());

  try {
    const githubApi = await getGithubApi();
    
    if (rateLimitCache.remaining <= 5) {
      await checkRateLimit();
      if (rateLimitCache.remaining <= 0) {
        throw new Error(formatRateLimitError(
          rateLimitCache.reset,
          rateLimitCache.remaining,
          rateLimitCache.total
        ));
      }
    }

    const response = await githubApi.get('/search/users', {
      params: searchParams
    });

    const users: GitHubUser[] = [];
    const batchSize = 10;
    
    for (let i = 0; i < response.data.items.length; i += batchSize) {
      const batch = response.data.items.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (user: any) => {
        try {
          const [userDetailsResponse, topLanguage, emailResult] = await Promise.all([
            githubApi.get(`/users/${user.login}`),
            fetchUserTopLanguage(user.login),
            findUserEmail(user.login)
          ]);

          return {
            ...userDetailsResponse.data,
            topLanguage,
            email: emailResult.email,
            source: emailResult.source,
            score: user.score
          };
        } catch (error) {
          console.error(`Error fetching details for user ${user.login}:`, error);
          return {
            login: user.login,
            id: user.id,
            avatar_url: user.avatar_url,
            score: user.score,
            topLanguage: null,
            email: null,
            source: null
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      users.push(...batchResults);
    }

    return {
      total_count: response.data.total_count,
      incomplete_results: response.data.incomplete_results,
      items: users
    };

  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      const resetTime = parseInt(error.response.headers['x-ratelimit-reset'] || '0');
      if (error.response.headers['x-ratelimit-remaining'] === '0') {
        throw new Error(formatRateLimitError(resetTime, 0, rateLimitCache.total));
      }
    }
    throw error;
  }
}

// Update the original searchUsers to use these new functions
export async function searchUsers(params: UserSearchParams): Promise<SearchResponse<GitHubUser>> {
  const { total_count } = await getTotalCount(params);
  const pageDetails = await fetchPageDetails(params);
  
  return {
    ...pageDetails,
    total_count // Use the accurate total count from the first call
  };
}

export async function loadUserDetails(username: string): Promise<Partial<GitHubUser>> {
  try {
    const githubApi = await getGithubApi();
    const userDetailsResponse = await githubApi.get(`/users/${username}`);

    // Fetch top language and email in parallel
    const [topLanguage, emailResult] = await Promise.all([
      fetchUserTopLanguage(username),
      findUserEmail(username)
    ]);

    const details = {
      ...userDetailsResponse.data,
      topLanguage,
      email: emailResult.email,
      source: emailResult.source
    };

    return details;
  } catch (error) {
    console.error(`Error fetching details for user ${username}:`, error);
    return {};
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
        .order('created_at', { ascending: false })
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

export async function findUserEmail(username: string): Promise<EmailResult> {
  try {
    // First, check if we have a stored email for this user
    const { data: storedEmails } = await supabase
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
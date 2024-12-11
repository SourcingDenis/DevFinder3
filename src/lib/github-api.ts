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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.provider_token) {
      console.error('No GitHub token available. Attempting to refresh authentication.');
      // Attempt to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session?.provider_token) {
        console.error('Failed to refresh GitHub authentication token.');
        throw new Error('Authentication failed. Please sign in again.');
      }
    }

    const api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `Bearer ${session?.provider_token || ''}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Add response interceptor to handle token refresh
    api.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Check if the error is due to an unauthorized request
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh the session
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session?.provider_token) {
              throw new Error('Failed to refresh authentication');
            }

            // Update the authorization header
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${refreshData.session.provider_token}`;
            }
            
            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Force re-authentication
            await supabase.auth.signOut();
            window.location.href = '/'; // Redirect to home/login page
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

    try {
      // Try to fetch email from user's public events
      const eventsResponse = await githubApi.get(`/users/${username}/events/public`);
      
      for (const event of eventsResponse.data) {
        if (event.payload?.commits) {
          for (const commit of event.payload.commits) {
            if (commit.author?.email && !commit.author.email.includes('noreply.github.com')) {
              // Store the found email
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              if (currentUser?.id) {
                await supabase.from('enriched_emails').insert({
                  github_username: username,
                  email: commit.author.email,
                  source: 'public_events_commit',
                  enriched_by: currentUser.id
                });
              }
              
              return { 
                email: commit.author.email, 
                source: 'public_events_commit' 
              };
            }
          }
        }
      }
    } catch (eventsError) {
      const errorMessage = isErrorWithMessage(eventsError) 
        ? eventsError.message 
        : 'Unknown error fetching public events';
      
      console.warn(`Could not fetch public events for ${username}:`, errorMessage);
    }

    try {
      // If no email found in events, try user's profile
      const userResponse = await githubApi.get(`/users/${username}`);
      
      if (userResponse.data.email) {
        // Store the found email
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser?.id) {
          await supabase.from('enriched_emails').insert({
            github_username: username,
            email: userResponse.data.email,
            source: 'github_profile',
            enriched_by: currentUser.id
          });
        }
        
        return { 
          email: userResponse.data.email, 
          source: 'github_profile' 
        };
      }
    } catch (profileError) {
      const errorMessage = isErrorWithMessage(profileError) 
        ? profileError.message 
        : 'Unknown error fetching user profile';
      
      console.warn(`Could not fetch profile for ${username}:`, errorMessage);
    }

    // No email found
    return { 
      email: null, 
      source: null 
    };
  } catch (error) {
    const errorMessage = isErrorWithMessage(error) 
      ? error.message 
      : 'Unexpected error in findUserEmail';
    
    console.error('Unexpected error in findUserEmail:', errorMessage);
    throw new Error(errorMessage);
  }
}

export async function storeUserEmail(username: string, email: string, source: string): Promise<void> {
  try {
    // Validate inputs
    if (!username || !email || !source) {
      throw new Error('Invalid input: username, email, and source are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate source
    const validSources = ['public_events_commit', 'github_profile', 'manual_input'];
    if (!validSources.includes(source)) {
      throw new Error(`Invalid email source. Must be one of: ${validSources.join(', ')}`);
    }

    // Check if user already exists
    const { data: existingUser, error: existError } = await supabase
      .from('saved_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (existError && existError.code !== 'PGRST116') {
      console.error('Error checking existing user:', existError);
      throw existError;
    }

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('saved_profiles')
        .update({ 
          email, 
          email_source: source,
          updated_at: new Date().toISOString() 
        })
        .eq('username', username);

      if (updateError) {
        console.error('Error updating user email:', updateError);
        throw updateError;
      }
    } else {
      // Insert new user
      const { error: insertError } = await supabase
        .from('saved_profiles')
        .insert({ 
          username, 
          email, 
          email_source: source,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        });

      if (insertError) {
        console.error('Error inserting user email:', insertError);
        throw insertError;
      }
    }

    console.log(`Successfully stored email for ${username} from ${source}`);
  } catch (error) {
    console.error('Error in storeUserEmail:', error);
    throw new Error(
      isErrorWithMessage(error) 
        ? error.message 
        : 'Unexpected error in storeUserEmail'
    );
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
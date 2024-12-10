import axios from 'axios';
import { UserSearchParams, GitHubUser, SearchResponse } from '@/types';
import { supabase } from './supabase';

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
      async error => {
        const originalRequest = error.config;

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
            originalRequest.headers['Authorization'] = `Bearer ${refreshData.session.provider_token}`;
            
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

      // Check for rate limit headers
      const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
      const rateLimitReset = response.headers['x-ratelimit-reset'];

      if (rateLimitRemaining && Number(rateLimitRemaining) < 10) {
        console.warn(`GitHub API rate limit is low. Remaining: ${rateLimitRemaining}. Resets at: ${new Date(Number(rateLimitReset) * 1000)}`);
      }

      // Fetch detailed user information with error handling
      const users = await Promise.all(
        response.data.items.map(async (user: any) => {
          try {
            const userDetailsResponse = await githubApi.get(`/users/${user.login}`);
            return {
              ...userDetailsResponse.data,
              score: user.score
            };
          } catch (userDetailError) {
            console.warn(`Could not fetch details for user ${user.login}:`, userDetailError);
            // Return minimal user information
            return {
              login: user.login,
              id: user.id,
              avatar_url: user.avatar_url,
              score: user.score
            };
          }
        })
      );

      return {
        items: users,
        total_count: response.data.total_count,
        incomplete_results: response.data.incomplete_results
      };
    } catch (apiError) {
      // Type-safe error handling
      if (axios.isAxiosError(apiError)) {
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
      console.error('Error setting up GitHub API request:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('Unexpected error in searchUsers:', error);
    throw error;
  }
}

export async function fetchAllUsers(params: Omit<UserSearchParams, 'page'>): Promise<GitHubUser[]> {
  const allUsers: GitHubUser[] = [];
  let currentPage = 1;
  const perPage = 100; // Maximum allowed by GitHub API

  while (true) {
    try {
      const response = await searchUsers({
        ...params,
        page: currentPage,
        per_page: perPage
      });

      allUsers.push(...response.items);

      // Check if we've fetched all users
      if (response.items.length < perPage || allUsers.length >= response.total_count) {
        break;
      }

      currentPage++;
    } catch (error) {
      console.error('Error fetching all users:', error);
      break;
    }
  }

  return allUsers;
}

export async function findUserEmail(username: string): Promise<{ email: string | null; source: string | null }> {
  try {
    console.log('DEBUG: findUserEmail started for', username);
    const githubApi = await getGithubApi();
    
    // Check public profile first
    console.log('DEBUG: Checking public profile');
    const userResponse = await githubApi.get(`/users/${username}`);
    if (userResponse.data.email) {
      console.log('DEBUG: Found public email:', userResponse.data.email);
      await storeUserEmail(username, userResponse.data.email, 'github_profile');
      return { email: userResponse.data.email, source: 'github_profile' };
    }

    // Try to find email in commits
    console.log('DEBUG: Checking commits');
    try {
      const reposResponse = await githubApi.get(`/users/${username}/repos`, {
        params: { sort: 'pushed', per_page: 5 }
      });

      for (const repo of reposResponse.data) {
        try {
          console.log('DEBUG: Checking commits in repo:', repo.name);
          const commitsResponse = await githubApi.get(`/repos/${username}/${repo.name}/commits`, {
            params: { per_page: 5 }
          });

          for (const commit of commitsResponse.data) {
            if (commit.commit?.author?.email && 
                !commit.commit.author.email.includes('noreply.github.com')) {
              console.log('DEBUG: Found commit email:', commit.commit.author.email);
              await storeUserEmail(username, commit.commit.author.email, 'github_commit');
              return { email: commit.commit.author.email, source: 'github_commit' };
            }
          }
        } catch (commitError) {
          console.log('DEBUG: Error checking commits:', commitError);
          continue;
        }
      }
    } catch (repoError) {
      console.log('DEBUG: Error checking repos:', repoError);
    }

    console.log('DEBUG: No email found, returning null');
    return { email: null, source: null };

  } catch (error) {
    console.error('DEBUG: Error in findUserEmail:', error);
    throw error;
  }
}

// New function to store user email in Supabase
export async function storeUserEmail(username: string, email: string, source: string): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Authentication error:', userError);
      throw userError;
    }

    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    // Validate source
    const validSources = ['github', 'twitter', 'linkedin', 'other', 'manual'];
    const normalizedSource = validSources.includes(source.toLowerCase()) 
      ? source.toLowerCase() 
      : 'other';

    // Extremely detailed logging
    console.log('Attempting to store email with details:', {
      username,
      email,
      source: normalizedSource,
      userId: user.id,
      userEmail: user.email
    });

    // Check if the profile already exists
    const { data: existingProfile, error: searchError } = await supabase
      .from('saved_profiles')
      .select('*')
      .eq('username', username)
      .eq('user_id', user.id)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Error searching for existing profile:', {
        code: searchError.code,
        message: searchError.message,
        details: searchError.details
      });
      throw searchError;
    }

    if (existingProfile) {
      // Update existing profile with email
      const { error: updateError } = await supabase
        .from('saved_profiles')
        .update({ 
          email, 
          email_source: normalizedSource 
        })
        .eq('id', existingProfile.id);

      if (updateError) {
        console.error('Error updating profile email:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details
        });
        throw updateError;
      }
    } else {
      // Insert new profile with email
      const insertData = {
        user_id: user.id,
        username,
        email,
        email_source: normalizedSource,
        github_url: `https://github.com/${username}`
      };

      console.log('Attempting to insert profile with data:', insertData);

      const { error: insertError } = await supabase
        .from('saved_profiles')
        .insert(insertData);

      if (insertError) {
        console.error('Error inserting new profile:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          context: insertData
        });
        throw insertError;
      }
    }

    console.log('Email stored successfully for username:', username);
  } catch (error) {
    console.error('Comprehensive error in storing user email:', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    });
    throw error;
  }
}
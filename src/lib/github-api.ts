import axios from 'axios';
import { UserSearchParams, GitHubUser, SearchResponse } from '@/types';
import { supabase } from './supabase';

const getGithubApi = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Add more robust token checking
  if (!session?.provider_token) {
    console.error('No GitHub token available. Please re-authenticate.');
    throw new Error('No GitHub token available');
  }

  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${session.provider_token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
};

export async function searchUsers(params: UserSearchParams): Promise<SearchResponse> {
  try {
    const githubApi = await getGithubApi();
    
    // Ensure there's a valid search query
    let searchQuery = params.query || 'type:user';
    if (params.language) searchQuery += ` language:${params.language}`;

    const response = await githubApi.get<SearchResponse>('/search/users', {
      params: {
        q: searchQuery,
        sort: params.sort || '',
        order: params.order || 'desc',
        per_page: params.per_page || 10,
        page: params.page || 1
      }
    });

    const users = await Promise.all(
      response.data.items.map(async (user) => {
        const userDetailsResponse = await githubApi.get<GitHubUser>(`/users/${user.login}`);
        const userDetails = userDetailsResponse.data;
        
        // Get user's top language
        let topLanguage = null;
        try {
          const reposResponse = await githubApi.get<{ language: string }[]>(`/users/${userDetails.login}/repos`, {
            params: { sort: 'pushed', per_page: 10 }
          });
          
          // Count languages
          const languageCounts = reposResponse.data.reduce((acc, repo) => {
            if (repo.language) {
              acc[repo.language] = (acc[repo.language] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);
          topLanguage = Object.keys(languageCounts).sort((a, b) => languageCounts[b] - languageCounts[a])[0];
        } catch (error) {
          console.error('Error fetching user repositories:', error);
        }

        return {
          ...userDetails,
          hireable: userDetails.hireable,
          topLanguage
        };
      })
    );

    return {
      items: users,
      total_count: response.data.total_count
    };
  } catch (error) {
    console.error('Error searching GitHub users:', error);
    throw error;
  }
}

export async function fetchAllUsers(params: Omit<UserSearchParams, 'page'>): Promise<GitHubUser[]> {
  const allUsers: GitHubUser[] = [];
  let currentPage = 1;
  
  while (true) {
    const response = await searchUsers({ ...params, page: currentPage });
    allUsers.push(...response.items);
    
    if (response.items.length < (params.per_page || 10) || allUsers.length >= 1000) {
      break;
    }
    currentPage++;
  }
  
  return allUsers;
}

export async function findUserEmail(username: string): Promise<string | null> {
  try {
    const githubApi = await getGithubApi();
    
    // Fetch user's events to find an email
    const eventsResponse = await githubApi.get(`/users/${username}/events/public`);
    const events = eventsResponse.data;

    // Look for PushEvent which might contain commit email
    for (const event of events) {
      if (event.type === 'PushEvent' && event.payload.commits) {
        const commit = event.payload.commits[0];
        if (commit.author && commit.author.email) {
          return commit.author.email;
        }
      }
    }

    // If no email found in events, try user's profile
    const userResponse = await githubApi.get(`/users/${username}`);
    return userResponse.data.email || null;
  } catch (error) {
    console.error(`Error finding email for user ${username}:`, error);
    return null;
  }
}
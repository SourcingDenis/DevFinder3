import axios from 'axios';
import { UserSearchParams, GitHubUser, SearchResponse } from '@/types/github';
import { supabase } from './supabase';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

const getGithubApi = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.provider_token) {
    console.error('No GitHub token available. Please re-authenticate.');
    throw new Error('No GitHub token available');
  }

  const api = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${session.provider_token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  return api;
};

export async function searchUsers(params: UserSearchParams): Promise<SearchResponse<GitHubUser>> {
  const githubApi = await getGithubApi();
  
  // Construct the search query
  let q = '';
  
  // Add main search query
  if (params.query || params.q) {
    q += (params.query || params.q);
  }
  
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

  // Add repos range if specified
  if (params.reposMin) {
    q += ` repos:>=${params.reposMin}`;
  }
  if (params.reposMax) {
    q += ` repos:<=${params.reposMax}`;
  }

  // Add hireable filter if specified
  if (params.hireable) {
    q += ' is:hireable';
  }

  const searchParams = {
    q,
    sort: params.sort,
    order: params.order,
    per_page: params.per_page || 30,
    page: params.page || 1
  };

  try {
    const response = await githubApi.get<SearchResponse<GitHubUser>>('/search/users', {
      params: searchParams
    });

    // Transform the response to include additional user details
    const enrichedUsers = await Promise.all(
      response.data.items.map(async (user) => {
        try {
          const { data: details } = await githubApi.get<GitHubUser>(`/users/${user.login}`);
          return {
            ...details,
            languages: details.languages || []
          };
        } catch (error) {
          console.error(`Error fetching details for user ${user.login}:`, error);
          return user;
        }
      })
    );

    return {
      ...response.data,
      items: enrichedUsers
    };
  } catch (error) {
    console.error('Error searching users:', error);
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

export async function searchGitHubUsers(params: UserSearchParams): Promise<SearchResponse<GitHubUser>> {
  const { q, location, language, sort, order, page = 1, per_page = 30 } = params;

  let query = q;
  if (location) query += ` location:${location}`;
  if (language) query += ` language:${language}`;

  const response = await octokit.search.users({
    q: query,
    sort,
    order,
    page,
    per_page,
  });

  return {
    total_count: response.data.total_count,
    incomplete_results: response.data.incomplete_results,
    items: response.data.items.map(transformGitHubUser),
  };
}

function transformGitHubUser(user: any): GitHubUser {
  return {
    id: user.id,
    login: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
    html_url: user.html_url,
    bio: user.bio,
    blog: user.blog,
    company: user.company,
    location: user.location,
    email: user.email,
    hireable: user.hireable,
    twitter_username: user.twitter_username,
    public_repos: user.public_repos,
    public_gists: user.public_gists,
    followers: user.followers,
    following: user.following,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
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
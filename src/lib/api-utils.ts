import axios from 'axios';
import { UserSearchParams, GitHubUser } from '@/types';

// Debounce function to limit API call frequency
export function debounce<F extends (...args: any[]) => any>(
  func: F, 
  delay: number = 300
): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

// Cached and optimized search users function
export class GitHubSearchService {
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): GitHubSearchService {
    return new GitHubSearchService();
  }

  async searchUsers({ 
    query, 
    language, 
    locations, 
    page = 1, 
    per_page = 10,
    sort,
    order
  }: UserSearchParams): Promise<{ items: GitHubUser[]; total_count: number }> {
    const cacheKey = JSON.stringify({ query, language, locations, page, per_page, sort, order });
    
    // Use localStorage for persistent caching
    const cachedResult = localStorage.getItem(`github_search_${cacheKey}`);
    if (cachedResult) {
      const parsed = JSON.parse(cachedResult);
      if (Date.now() - parsed.timestamp < this.CACHE_DURATION) {
        return { 
          items: parsed.items, 
          total_count: parsed.total_count 
        };
      }
    }

    // Optimize search query construction
    const searchQuery = [
      query,
      language && `language:${language}`,
      locations?.length && `(${locations.map(loc => `location:${loc}`).join(' OR ')})`
    ].filter(Boolean).join(' ');

    try {
      const githubApi = axios.create({
        baseURL: 'https://api.github.com',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(import.meta.env.VITE_GITHUB_TOKEN && {
            'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`
          })
        }
      });

      // Batch user search request
      const { data: searchData } = await githubApi.get<{
        items: Array<{
          login: string;
          id: number;
          avatar_url: string;
          html_url: string;
          score: number;
        }>;
        total_count: number;
      }>('/search/users', {
        params: {
          q: searchQuery.trim(),
          sort: sort || 'best-match',
          order: order || 'desc',
          per_page,
          page
        }
      });

      // Batch fetch user details in chunks to avoid rate limiting
      const users: GitHubUser[] = [];
      const chunkSize = 5;
      for (let i = 0; i < searchData.items.length; i += chunkSize) {
        const chunk = searchData.items.slice(i, i + chunkSize);
        const detailsPromises = chunk.map((user) => 
          githubApi.get<Omit<GitHubUser, 'score'>>(`/users/${user.login}`)
            .then(response => ({
              ...response.data,
              score: user.score // Add score from search result
            }))
            .catch(() => {
              // Create a fallback user object that matches GitHubUser interface
              const fallbackUser: GitHubUser = {
                id: user.id,
                login: user.login,
                avatar_url: user.avatar_url,
                html_url: user.html_url,
                name: '',
                company: '',
                blog: '',
                location: '',
                email: '',
                bio: '',
                public_repos: 0,
                public_gists: 0,
                followers: 0,
                following: 0,
                created_at: new Date().toISOString(),
                score: user.score // Add score from search result
              };
              return fallbackUser;
            })
        );
        
        const chunkResults = await Promise.all(detailsPromises);
        users.push(...chunkResults);
      }

      const result = {
        items: users,
        total_count: searchData.total_count,
        timestamp: Date.now()
      };

      // Cache the results
      localStorage.setItem(`github_search_${cacheKey}`, JSON.stringify(result));

      return {
        items: users,
        total_count: searchData.total_count
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }
}

// Optimized email discovery function
export async function discoverGitHubEmails(username: string): Promise<{ emails: string[], source: 'github_commit' | 'github_profile' | 'generated' }> {
  try {
    const emails = new Set<string>();
    
    // Limit to 3 repositories to reduce API calls
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=3`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevFinder'
      }
    });
    
    if (!reposResponse.ok) {
      throw new Error(`Failed to fetch repos: ${reposResponse.statusText}`);
    }
    
    const repos = await reposResponse.json();
    
    // Use Promise.all for parallel processing of commits
    await Promise.all(repos.map(async (repo: any) => {
      try {
        const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=2`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'DevFinder'
          }
        });
        
        if (!commitsResponse.ok) {
          console.warn(`Failed to fetch commits for ${repo.name}: ${commitsResponse.statusText}`);
          return;
        }
        
        const commits = await commitsResponse.json();
        
        commits.forEach((commit: any) => {
          if (commit.commit?.author?.email && !commit.commit.author.email.includes('users.noreply.github')) {
            emails.add(commit.commit.author.email);
          }
        });
      } catch (error) {
        console.warn(`Error processing commits for ${repo.name}:`, error);
      }
    }));

    return { 
      emails: Array.from(emails), 
      source: emails.size > 0 ? 'github_commit' : 'generated' 
    };
  } catch (error) {
    console.error('Error discovering emails:', error);
    return { emails: [], source: 'generated' };
  }
}

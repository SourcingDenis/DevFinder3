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
  private static instance: GitHubSearchService;
  private searchCache: Map<string, { items: GitHubUser[]; total_count: number; timestamp: number }>;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.searchCache = new Map();
  }

  static getInstance(): GitHubSearchService {
    if (!GitHubSearchService.instance) {
      GitHubSearchService.instance = new GitHubSearchService();
    }
    return GitHubSearchService.instance;
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
    // Create a unique cache key based on all search parameters
    const cacheKey = JSON.stringify({ query, language, locations, page, per_page, sort, order });
    
    // Check cache first
    const cachedResult = this.searchCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < this.CACHE_DURATION) {
      return { 
        items: cachedResult.items, 
        total_count: cachedResult.total_count 
      };
    }

    // Construct optimized search query
    let searchQuery = query || '';
    if (language) searchQuery += ` language:${language}`;
    if (locations?.length) {
      // Use location:X OR location:Y for better performance
      searchQuery += ` (${locations.map(loc => `location:${loc}`).join(' OR ')})`;
    }

    try {
      const githubApi = axios.create({
        baseURL: 'https://api.github.com',
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const response = await githubApi.get('/search/users', {
        params: {
          q: searchQuery.trim(),
          sort: sort || 'best-match',
          order: order || 'desc',
          per_page,
          page
        }
      });

      // Fetch detailed information for each user in parallel
      const userDetailsPromises = response.data.items.map(async (user: any) => {
        try {
          const [userDetails, topLanguage] = await Promise.all([
            githubApi.get(`/users/${user.login}`),
            this.fetchUserTopLanguage(user.login)
          ]);

          return {
            ...userDetails.data,
            topLanguage,
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
      });

      const users = await Promise.all(userDetailsPromises);

      // Cache the result with timestamp
      this.searchCache.set(cacheKey, {
        items: users,
        total_count: response.data.total_count,
        timestamp: Date.now()
      });

      return {
        items: users,
        total_count: response.data.total_count
      };
    } catch (error) {
      console.error('Error searching GitHub users:', error);
      throw error;
    }
  }

  private async fetchUserTopLanguage(username: string): Promise<string | null> {
    try {
      const githubApi = axios.create({
        baseURL: 'https://api.github.com',
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const response = await githubApi.get(`/users/${username}/repos`, {
        params: {
          sort: 'updated',
          per_page: 5
        }
      });

      const languages = new Map<string, number>();
      
      for (const repo of response.data) {
        if (repo.language) {
          languages.set(repo.language, (languages.get(repo.language) || 0) + 1);
        }
      }

      if (languages.size === 0) return null;

      return Array.from(languages.entries())
        .sort((a, b) => b[1] - a[1])[0][0];
    } catch (error) {
      console.error(`Error fetching top language for user ${username}:`, error);
      return null;
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

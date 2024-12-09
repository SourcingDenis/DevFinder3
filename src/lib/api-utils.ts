import axios from 'axios';
import { UserSearchParams, GitHubUser } from '@/types';

// Simple in-memory LRU cache
class LRUCache<K extends string | number, V> {
  private cache: Map<K, V> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (item) {
      // Move the accessed item to the end to show it was recently used
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key: K, value: V): void {
    // If cache is full, delete the least recently used item
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  delete(key: K | undefined): void {
    if (key !== undefined && this.cache.has(key)) {
      this.cache.delete(key);
    }
  }
}

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
  private searchCache = new LRUCache<string, GitHubUser[]>();
  private static instance: GitHubSearchService;

  private constructor() {}

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
    per_page = 10 
  }: UserSearchParams): Promise<{ items: GitHubUser[], total_count: number }> {
    // Create a unique cache key based on search parameters
    const cacheKey = JSON.stringify({ query, language, locations, page, per_page });
    
    // Check cache first
    const cachedResult = this.searchCache.get(cacheKey);
    if (cachedResult) {
      return { 
        items: cachedResult, 
        total_count: cachedResult.length 
      };
    }

    // Construct search query
    let searchQuery = query;
    if (language) searchQuery += ` language:${language}`;
    if (locations?.length) searchQuery += ` ${locations.map(loc => `location:${loc}`).join(' ')}`;

    try {
      const response = await axios.get('https://api.github.com/search/users', {
        params: {
          q: searchQuery,
          page,
          per_page
        },
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      // Cache the result
      this.searchCache.set(cacheKey, response.data.items);

      return {
        items: response.data.items,
        total_count: response.data.total_count
      };
    } catch (error) {
      console.error('Error searching GitHub users:', error);
      return { items: [], total_count: 0 };
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

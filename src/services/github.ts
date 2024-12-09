import { GitHubSearchService } from '@/lib/api-utils';
import { UserSearchParams, GitHubUser } from '@/types';

export async function searchUsers(params: UserSearchParams): Promise<{ items: GitHubUser[], total_count: number }> {
  const searchService = GitHubSearchService.getInstance();
  return searchService.searchUsers(params);
}

export const fetchGitHubUser = async (username: string): Promise<GitHubUser | null> => {
  try {
    const searchService = GitHubSearchService.getInstance();
    const users = await searchService.searchUsers({ 
      query: username, 
      page: 1, 
      per_page: 1 
    });

    return users.items.length > 0 ? users.items[0] : null;
  } catch (error) {
    console.error(`Error fetching GitHub user ${username}:`, error);
    return null;
  }
};
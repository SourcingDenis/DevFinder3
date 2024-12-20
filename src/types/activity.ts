import type { GitHubUser, UserSearchParams } from './index';

export type ActivityType = 'search' | 'save';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: string;
  data: SearchActivity | SaveActivity;
}

export interface SearchActivity {
  query: string;
  searchParams: UserSearchParams;
}

export interface SaveActivity {
  user: Partial<GitHubUser>;
  listId?: number;
}

import { GitHubUser } from './github';

export interface SaveProfileButtonProps {
  user: GitHubUser;
  isSaved?: boolean;
  onRemoveSaved?: () => void;
}

export interface UserEmailsProps {
  className?: string;
}

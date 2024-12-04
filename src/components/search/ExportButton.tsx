import React from 'react';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { GitHubUser, UserSearchParams } from '@/types';
import { exportUsersToCSV } from '@/lib/csv-utils';
import { fetchAllUsers } from '@/lib/github-api';
import { useAuth } from '../auth/AuthProvider';

interface ExportButtonProps {
  currentUsers: GitHubUser[];
  searchParams: Omit<UserSearchParams, 'page'> | null;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  currentUsers, 
  searchParams, 
  disabled 
}) => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = React.useCallback(async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      const usersToExport = searchParams ? await fetchAllUsers(searchParams) : currentUsers;
      await exportUsersToCSV(usersToExport);
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsExporting(false);
    }
  }, [user, searchParams, currentUsers]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!user || disabled || isExporting || currentUsers.length === 0}
      className="flex items-center gap-2"
    >
      {isExporting ? 'Exporting...' : 'Export to CSV'}
      <Download className="h-4 w-4" />
    </Button>
  );
};
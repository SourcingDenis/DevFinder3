import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { GitHubUser, UserSearchParams } from '@/types/github';
import { exportUsersToCSV } from '@/lib/csv-utils';
import { fetchAllUsers } from '@/lib/github-api';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);

  const generateFilename = React.useCallback(() => {
    if (!searchParams) return 'github_users.csv';

    const parts: string[] = [];

    // Add query if exists
    if (searchParams.query || searchParams.q) {
      parts.push((searchParams.query || searchParams.q).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase());
    }

    // Add language if specified
    if (searchParams.language) {
      parts.push(`lang_${searchParams.language.toLowerCase()}`);
    }

    // Add locations if specified
    if (searchParams.locations && searchParams.locations.length > 0) {
      parts.push(`loc_${searchParams.locations.join('_').toLowerCase()}`);
    }

    // Construct filename
    return `github_users_${parts.join('_')}.csv`;
  }, [searchParams]);

  const handleExport = React.useCallback(async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      let usersToExport = currentUsers;

      // If we have search params, fetch all users for the current search
      if (searchParams) {
        const allUsers = await fetchAllUsers({
          ...searchParams,
          q: searchParams.query || searchParams.q || '',
        });
        usersToExport = allUsers;
      }

      // Export users to CSV
      const filename = generateFilename();
      await exportUsersToCSV(usersToExport, filename);

      toast({
        title: 'Export successful',
        description: `Users have been exported to ${filename}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting users.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [currentUsers, searchParams, user, generateFilename, toast]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting || !user}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? 'Exporting...' : 'Export'}
    </Button>
  );
};
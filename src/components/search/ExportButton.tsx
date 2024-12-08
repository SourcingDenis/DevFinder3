import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { GitHubUser, UserSearchParams } from '@/types';
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
    if (searchParams.query) {
      parts.push(searchParams.query.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase());
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
      const usersToExport = searchParams ? await fetchAllUsers(searchParams) : currentUsers;
      
      // Generate dynamic filename
      const filename = generateFilename();

      // Add progress tracking
      await exportUsersToCSV(usersToExport, {
        onProgress: (progress) => {
          console.log(`Export progress: ${progress}%`);
        },
        filename // Pass filename to export function
      });

      toast({
        title: 'Export Successful',
        description: `Exported ${usersToExport.length} users to ${filename}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Export failed', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  }, [user, searchParams, currentUsers, toast, generateFilename]);

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
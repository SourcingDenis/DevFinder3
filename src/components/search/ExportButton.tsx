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
  searchParams: UserSearchParams;
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
  const [exportProgress, setExportProgress] = React.useState(0);

  const generateFilename = React.useCallback(() => {
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

    // Add timestamp for uniqueness
    const timestamp = new Date().toISOString().split('T')[0];
    parts.push(timestamp);

    // Construct filename
    return `github_users_${parts.join('_')}.csv`;
  }, [searchParams]);

  const handleExport = async () => {
    if (!user || !searchParams || isExporting) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Use the current users if less than 100, otherwise fetch all users
      const usersToExport = currentUsers.length < 100 
        ? currentUsers 
        : await fetchAllUsers(searchParams);

      const filename = generateFilename();
      await exportUsersToCSV(usersToExport, { 
        filename,
        onProgress: setExportProgress 
      });

      toast({
        title: 'Export Successful',
        description: `Users exported to ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export users',
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <Button
      variant="outline"
      size="default"
      onClick={handleExport}
      disabled={disabled || isExporting || !searchParams?.query}
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? `Exporting ${exportProgress}%` : 'Export'}
    </Button>
  );
};
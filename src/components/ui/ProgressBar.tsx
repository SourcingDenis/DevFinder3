import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  variant?: 'default' | 'success' | 'error';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  variant = 'default',
  className = ''
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Variant color classes - now using black and white palette
  const variantClasses = {
    default: {
      track: 'bg-gray-100',
      indicator: 'bg-black',
      text: 'text-gray-800'
    },
    success: {
      track: 'bg-gray-100',
      indicator: 'bg-green-800',
      text: 'text-gray-900'
    },
    error: {
      track: 'bg-gray-100',
      indicator: 'bg-red-800',
      text: 'text-gray-900'
    }
  };

  const { track, indicator, text } = variantClasses[variant];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className={`text-sm font-medium mb-2 ${text}`}>
          {label} ({clampedProgress}%)
        </div>
      )}
      <div className={`w-full h-2.5 rounded-full ${track} overflow-hidden`}>
        <div 
          className={`h-full ${indicator} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Hook for managing export progress
export const useExportProgress = () => {
  const [progress, setProgress] = React.useState(0);
  const [isExporting, setIsExporting] = React.useState(false);

  const startExport = React.useCallback(() => {
    setIsExporting(true);
    setProgress(0);
  }, []);

  const updateProgress = React.useCallback((newProgress: number) => {
    setProgress(newProgress);
    
    if (newProgress >= 100) {
      setIsExporting(false);
    }
  }, []);

  const resetProgress = React.useCallback(() => {
    setProgress(0);
    setIsExporting(false);
  }, []);

  return {
    progress,
    isExporting,
    startExport,
    updateProgress,
    resetProgress
  };
};

// Wrapper component for export with progress
interface ExportProgressProps {
  onExport: (onProgress: (progress: number) => void) => Promise<void>;
  label?: string;
  buttonLabel?: string;
}

export const ExportWithProgress: React.FC<ExportProgressProps> = ({ 
  onExport, 
  label = 'Exporting',
  buttonLabel = 'Start Export'
}) => {
  const { 
    progress, 
    isExporting, 
    startExport, 
    updateProgress 
  } = useExportProgress();

  const handleExport = async () => {
    startExport();
    try {
      await onExport(updateProgress);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <div className="space-y-2">
      <button 
        onClick={handleExport}
        disabled={isExporting}
        className={`
          px-4 py-2 rounded border 
          ${isExporting 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
            : 'bg-white text-black border-black hover:bg-gray-100'
          }
        `}
      >
        {isExporting ? 'Exporting...' : buttonLabel}
      </button>
      
      {isExporting && (
        <ProgressBar 
          progress={progress} 
          label={label}
          variant={progress === 100 ? 'success' : 'default'}
        />
      )}
    </div>
  );
};

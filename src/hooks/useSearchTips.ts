import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export function useSearchTips() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      const isPermanentlyHidden = localStorage.getItem(`search-tips-hidden-${user.id}`);
      const hasSeenTips = localStorage.getItem(`search-tips-seen-${user.id}`);
      
      if (!isPermanentlyHidden) {
        setIsVisible(true);
        if (!hasSeenTips) {
          setIsExpanded(true);
          localStorage.setItem(`search-tips-seen-${user.id}`, 'true');
        }
      }
    }
  }, [user]);

  const hidePermanently = () => {
    if (user) {
      localStorage.setItem(`search-tips-hidden-${user.id}`, 'true');
      setIsVisible(false);
    }
  };

  return {
    isVisible,
    isExpanded,
    setIsExpanded,
    hidePermanently
  };
}

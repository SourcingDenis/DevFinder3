import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

export function useAuthRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const prevUserRef = useRef(user);

  useEffect(() => {
    // Only navigate if the auth state has actually changed
    if (prevUserRef.current !== user) {
      if (user) {
        // User has signed in - navigate to home page
        navigate('/', { replace: true });
      } else if (prevUserRef.current) {
        // User has signed out - navigate to home with FAQ
        navigate('/', { replace: true });
      }
      prevUserRef.current = user;
    }
  }, [user, navigate]);

  return user;
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function GmailCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home or search page after authentication
    navigate('/search');
  }, [navigate]);

  return null;
}

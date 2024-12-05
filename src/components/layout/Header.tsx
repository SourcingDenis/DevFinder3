import { ThemeToggle } from '../theme/ThemeToggle';
import { AuthButton } from '../auth/AuthButton';
import { Code2, Settings } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

export function Header() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const handleLogoClick = () => {
    // First navigate to home
    navigate('/', { replace: true });
    // Then clear all search params
    setSearchParams({}, { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <Code2 className="h-5 w-5" />
          <span className="font-semibold text-lg tracking-tight">
            DevFinder
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-full"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          )}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
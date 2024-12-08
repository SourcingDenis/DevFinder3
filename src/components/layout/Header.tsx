import { ThemeToggle } from '../theme/ThemeToggle';
import { Code2, LogOut, Menu, Settings } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle 
} from "@/components/ui/sheet";
import { GitHubLoginButton } from '@/components/auth/GitHubLoginButton';
import { Linkedin } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const handleLogoClick = () => {
    navigate('/home', { replace: true });
    setSearchParams({}, { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      <Link
        to="/search"
        onClick={() => {
          setSearchParams({}, { replace: true });
        }}
        className={cn(
          "text-sm font-medium transition-colors hover:text-foreground/80",
          isActive('/search') ? "text-foreground" : "text-foreground/60"
        )}
      >
        Search
      </Link>
      <Link
        to="/bookmarks"
        className={cn(
          "text-sm font-medium transition-colors hover:text-foreground/80",
          isActive('/bookmarks') ? "text-foreground" : "text-foreground/60"
        )}
      >
        Saved Profiles
      </Link>
      <Link
        to="/saved-searches"
        className={cn(
          "text-sm font-medium transition-colors hover:text-foreground/80",
          isActive('/saved-searches') ? "text-foreground" : "text-foreground/60"
        )}
      >
        Saved Searches
      </Link>
    </>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link 
            to="/home"
            className="flex items-center gap-3 hover:opacity-90 transition-all duration-200 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <Code2 className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              DevFinder
            </span>
          </Link>

          {user && (
            <nav className="flex-1 hidden md:flex items-center gap-6">
              <NavLinks />
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!user && (
            <div className="flex items-center space-x-2">
              <GitHubLoginButton confetti={true} />
              <Button 
                variant="outline" 
                size="icon"
                onClick={async () => {
                  try {
                    await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`
                      }
                    });
                  } catch (error) {
                    console.error('Google OAuth error:', error);
                  }
                }}
                className="hover:bg-gray-100"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                  <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                  <path fill="#FBBC05" d="M11.68 28.18c-.75-2.24-1.19-4.65-1.19-7.18s.44-4.94 1.19-7.18V8.13H4.34A23.933 23.933 0 0 0 0 24c0 3.86.93 7.5 2.59 10.73l7.09-5.55z"/>
                  <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.29 29.93 1 24 1 15.4 1 7.96 5.93 4.34 14.27l7.34 5.7c1.74-5.2 6.59-9.02 12.32-9.02z"/>
                </svg>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                disabled
                className="hover:bg-gray-100"
              >
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          )}
          <div className="hidden md:flex items-center gap-4">
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
          </div>

          {/* Mobile Menu */}
          {user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle></SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                  <div className="flex items-center gap-4 mt-4 md:hidden">
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={handleSignOut}
                      className="w-full justify-start"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
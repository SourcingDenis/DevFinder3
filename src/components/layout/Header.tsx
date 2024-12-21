import { ThemeToggle } from '../theme/ThemeToggle';
import { Code2, LogOut, Menu, Settings } from 'lucide-react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { GitHubLoginButton } from '@/components/auth/GitHubLoginButton';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle 
} from "@/components/ui/sheet";

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
        to="/saved-profiles"
        className={cn(
          "text-sm font-medium transition-colors hover:text-foreground/80",
          isActive('/saved-profiles') ? "text-foreground" : "text-foreground/60"
        )}
      >
        Saved Profiles
      </Link>
    </>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <Link 
            to="/home"
            className="flex items-center gap-2 md:gap-3 hover:opacity-90 transition-all duration-200 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <Code2 className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-bold text-lg md:text-xl tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              DevFinder
            </span>
          </Link>

          {user && (
            <nav className="flex-1 hidden md:flex items-center gap-6">
              <NavLinks />
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          {!user && <GitHubLoginButton />}
          {user && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="rounded-full hidden md:flex"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 mt-6">
                    <nav className="flex flex-col gap-4">
                      <NavLinks />
                    </nav>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={() => navigate('/settings')}
                        className="w-full justify-start"
                      >
                        <Settings className="h-5 w-5 mr-2" />
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={handleSignOut}
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
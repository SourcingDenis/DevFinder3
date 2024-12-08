import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme/ModeToggle';
import { useAuth } from '@/hooks/useAuth';
import { GitHubLoginButton } from '@/components/auth/GitHubLoginButton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Search', href: '/search' },
  { name: 'Saved Profiles', href: '/saved-profiles' },
  { name: 'Saved Searches', href: '/saved-searches' },
  { name: 'Settings', href: '/settings' },
];

export function Header() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl mx-auto">
        <div className="flex h-14 items-center justify-between">
          <div className="flex gap-8 items-center">
            <Link to="/" className="font-semibold">
              DevFinder
            </Link>
            <nav className="hidden md:flex gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.user_name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium">
                    {user.user_metadata.user_name}
                  </span>
                </div>
              ) : (
                <GitHubLoginButton />
              )}
            </div>
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 sm:w-80">
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                        isOpen && "text-foreground"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {!user && (
                    <GitHubLoginButton className="w-full justify-center" />
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { GithubIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

const triggerConfetti = (isMobile = false) => {
  // Reduce particle count for mobile devices
  const count = isMobile ? 100 : 200;
  const defaults = {
    origin: { y: 0.1, x: 0.9 }, // Position near the header button
    spread: isMobile ? 50 : 70,
    zIndex: 9999,
    disableForReducedMotion: true
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      scalar: isMobile ? 0.7 : 1.2,
    });
  }

  // Adjust particle systems for mobile/desktop
  if (isMobile) {
    fire(0.25, {
      spread: 40,
      startVelocity: 25,
      colors: ['#FFD700', '#FFA500', '#FF6347']
    });

    fire(0.2, {
      spread: 50,
      colors: ['#00ff00', '#0099ff', '#ff00ff']
    });

    fire(0.3, {
      spread: 60,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#ffffff', '#f0f0f0']
    });
  } else {
    fire(0.25, {
      spread: 26,
      startVelocity: 45,
      colors: ['#FFD700', '#FFA500', '#FF6347']
    });

    fire(0.2, {
      spread: 60,
      colors: ['#00ff00', '#0099ff', '#ff00ff']
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#ffffff', '#f0f0f0', '#d0d0d0']
    });
  }
};

export function GitHubLoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => {
        const isMobile = window.innerWidth <= 768;
        triggerConfetti(isMobile);
      }}
      onTouchStart={() => {
        const isMobile = window.innerWidth <= 768;
        triggerConfetti(isMobile);
      }}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
      <div className="relative">
        <Button onClick={handleLogin} variant="outline" className="relative">
          <GithubIcon className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}

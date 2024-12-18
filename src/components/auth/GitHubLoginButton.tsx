import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import Confetti from 'react-confetti';

interface GitHubLoginButtonProps {
  confetti?: boolean;
  variant?: 'header' | 'hero';
}

export function GitHubLoginButton({ confetti = false, variant = 'hero' }: GitHubLoginButtonProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleLogin = async () => {
    try {
      console.log('Starting GitHub OAuth flow...');

      // If confetti is enabled, show it and wait for animation to complete
      const confettiPromise = new Promise<void>((resolve) => {
        if (confetti) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            resolve();
          }, 3000);
        } else {
          resolve();
        }
      });

      // Wait for confetti to complete before starting OAuth
      await confettiPromise;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user user:email'
        }
      });
      
      if (error) {
        console.error('GitHub OAuth error:', error);
        alert(`Login failed: ${error.message}`);
        return;
      }

      console.log('OAuth initiated successfully:', data);
    } catch (err) {
      console.error('Login error:', err);
      alert('Failed to start login process');
    }
  };

  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 select-none";
  const variantStyles = variant === 'header' 
    ? "px-4 py-1.5 text-sm bg-background hover:bg-accent" 
    : "px-6 py-2.5 text-base bg-background hover:bg-accent/80";

  return (
    <>
      {showConfetti && <Confetti />}
      {variant === 'header' ? (
        <>
          <button 
            onClick={handleLogin} 
            className={`${baseStyles} ${variantStyles} border border-border/40 hidden md:flex items-center gap-2`}
          >
            <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 .333C4.925.333.833 4.425.833 9.5c0 4.06 2.632 7.498 6.284 8.71.46.085.628-.199.628-.442 0-.218-.008-.797-.012-1.563-2.555.555-3.094-1.232-3.094-1.232-.418-1.06-1.02-1.343-1.02-1.343-.833-.569.063-.558.063-.558.922.065 1.407.948 1.407.948.819 1.41 2.148 1.002 2.67.766.083-.593.32-.996.583-1.225-2.04-.232-4.183-1.02-4.183-4.538 0-1.002.358-1.822.944-2.464-.095-.232-.409-1.168.09-2.434 0 0 .77-.246 2.523.94a8.787 8.787 0 012.298-.31 8.787 8.787 0 012.298.31c1.752-1.186 2.52-.94 2.52-.94.5 1.266.186 2.202.091 2.434.587.642.944 1.462.944 2.464 0 3.527-2.147 4.303-4.194 4.53.329.283.621.842.621 1.697 0 1.225-.011 2.214-.011 2.514 0 .245.166.532.634.442 3.648-1.215 6.28-4.652 6.28-8.71C19.167 4.425 15.075.333 10 .333z" clipRule="evenodd"/>
            </svg>
            Sign in with GitHub
          </button>
          <button 
            onClick={handleLogin} 
            className={`${baseStyles} ${variantStyles} border border-border/40 md:hidden`}
          >
            <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 .333C4.925.333.833 4.425.833 9.5c0 4.06 2.632 7.498 6.284 8.71.46.085.628-.199.628-.442 0-.218-.008-.797-.012-1.563-2.555.555-3.094-1.232-3.094-1.232-.418-1.06-1.02-1.343-1.02-1.343-.833-.569.063-.558.063-.558.922.065 1.407.948 1.407.948.819 1.41 2.148 1.002 2.67.766.083-.593.32-.996.583-1.225-2.04-.232-4.183-1.02-4.183-4.538 0-1.002.358-1.822.944-2.464-.095-.232-.409-1.168.09-2.434 0 0 .77-.246 2.523.94a8.787 8.787 0 012.298-.31 8.787 8.787 0 012.298.31c1.752-1.186 2.52-.94 2.52-.94.5 1.266.186 2.202.091 2.434.587.642.944 1.462.944 2.464 0 3.527-2.147 4.303-4.194 4.53.329.283.621.842.621 1.697 0 1.225-.011 2.214-.011 2.514 0 .245.166.532.634.442 3.648-1.215 6.28-4.652 6.28-8.71C19.167 4.425 15.075.333 10 .333z" clipRule="evenodd"/>
            </svg>
          </button>
        </>
      ) : (
        <button 
          onClick={handleLogin} 
          className={`${baseStyles} ${variantStyles} border border-border/40 w-full`}
        >
          <svg className="mr-2 w-5 h-5" aria-hidden="true" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 .333C4.925.333.833 4.425.833 9.5c0 4.06 2.632 7.498 6.284 8.71.46.085.628-.199.628-.442 0-.218-.008-.797-.012-1.563-2.555.555-3.094-1.232-3.094-1.232-.418-1.06-1.02-1.343-1.02-1.343-.833-.569.063-.558.063-.558.922.065 1.407.948 1.407.948.819 1.41 2.148 1.002 2.67.766.083-.593.32-.996.583-1.225-2.04-.232-4.183-1.02-4.183-4.538 0-1.002.358-1.822.944-2.464-.095-.232-.409-1.168.09-2.434 0 0 .77-.246 2.523.94a8.787 8.787 0 012.298-.31 8.787 8.787 0 012.298.31c1.752-1.186 2.52-.94 2.52-.94.5 1.266.186 2.202.091 2.434.587.642.944 1.462.944 2.464 0 3.527-2.147 4.303-4.194 4.53.329.283.621.842.621 1.697 0 1.225-.011 2.214-.011 2.514 0 .245.166.532.634.442 3.648-1.215 6.28-4.652 6.28-8.71C19.167 4.425 15.075.333 10 .333z" clipRule="evenodd"/>
          </svg>
          Sign in with GitHub
        </button>
      )}
    </>
  );
}

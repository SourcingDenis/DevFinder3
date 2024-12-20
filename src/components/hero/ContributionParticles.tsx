import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  intensity: number;
}

export function ContributionParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>();

  const colors = [
    'rgba(39, 137, 61, 0.8)',   // Dark green
    'rgba(64, 196, 99, 0.8)',   // Medium green
    'rgba(48, 161, 78, 0.8)',   // Light green
    'rgba(33, 110, 57, 0.8)',   // Very dark green
  ];

  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    const size = Math.random() * 4 + 2;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      },
      intensity: Math.random(),
    };
  };

  const initParticles = (canvas: HTMLCanvasElement) => {
    const particleCount = Math.floor((canvas.width * canvas.height) / 8000);
    particles.current = Array.from({ length: particleCount }, () => 
      createParticle(canvas)
    );
  };

  const drawParticle = (
    ctx: CanvasRenderingContext2D,
    particle: Particle
  ) => {
    ctx.beginPath();
    ctx.rect(
      particle.x - particle.size / 2,
      particle.y - particle.size / 2,
      particle.size,
      particle.size
    );
    ctx.fillStyle = particle.color;
    ctx.fill();
  };

  const updateParticle = (particle: Particle, canvas: HTMLCanvasElement) => {
    particle.x += particle.velocity.x;
    particle.y += particle.velocity.y;

    // Bounce off edges
    if (particle.x < 0 || particle.x > canvas.width) {
      particle.velocity.x *= -1;
    }
    if (particle.y < 0 || particle.y > canvas.height) {
      particle.velocity.y *= -1;
    }

    // Keep particles within bounds
    particle.x = Math.max(0, Math.min(canvas.width, particle.x));
    particle.y = Math.max(0, Math.min(canvas.height, particle.y));
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.current.forEach((particle) => {
      updateParticle(particle, canvas);
      drawParticle(ctx, particle);
    });

    animationFrameId.current = requestAnimationFrame(animate);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initParticles(canvas);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    handleResize();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full -z-10 opacity-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

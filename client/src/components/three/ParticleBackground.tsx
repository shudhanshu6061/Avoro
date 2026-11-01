'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  gold: boolean;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const count = 160;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.12,
        size: Math.random() * 1.5 + 0.4,
        opacity: Math.random() * 0.5 + 0.1,
        gold: Math.random() > 0.65,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / 160);
        const glow = p.opacity + proximity * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + proximity, 0, Math.PI * 2);

        if (p.gold) {
          ctx.fillStyle = `rgba(200, 160, 60, ${Math.min(glow, 0.9)})`;
        } else {
          ctx.fillStyle = `rgba(240, 235, 224, ${Math.min(glow * 0.5, 0.35)})`;
        }

        ctx.fill();

        if (proximity > 0.15 && p.gold) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 40 * proximity);
          grad.addColorStop(0, `rgba(200, 160, 60, ${proximity * 0.12})`);
          grad.addColorStop(1, 'rgba(200, 160, 60, 0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, 40 * proximity, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="avoro-particles"
      aria-hidden="true"
    />
  );
}

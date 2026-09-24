'use client';

import { animate } from 'animejs';

/**
 * Fires an elegant particle burst animation using HTML5 Canvas & Anime.js
 */
export function fireConfettiBurst(originX?: number, originY?: number) {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const startX = originX ?? window.innerWidth / 2;
  const startY = originY ?? window.innerHeight / 3;

  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#38bdf8'];
  const particleCount = 48;
  const particles: Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    angle: number;
    speed: number;
    rotation: number;
    alpha: number;
  }> = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 8 + 4;
    particles.push({
      x: startX,
      y: startY,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle,
      speed,
      rotation: Math.random() * 360,
      alpha: 1,
    });
  }

  const animObj = { progress: 0 };

  animate(animObj, {
    progress: 1,
    duration: 1200,
    ease: 'outQuart',
    onUpdate: () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const p = animObj.progress;

      for (const pt of particles) {
        const currentDist = pt.speed * 35 * p;
        const x = pt.x + Math.cos(pt.angle) * currentDist;
        const y = pt.y + Math.sin(pt.angle) * currentDist + p * p * 90; // gravity
        const alpha = Math.max(0, 1 - p * 1.1);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((pt.rotation + p * 360) * (Math.PI / 180));
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size * 0.6);
        ctx.restore();
      }
    },
    onComplete: () => {
      canvas.remove();
    },
  });
}

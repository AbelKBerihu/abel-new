import { useEffect, useRef } from 'react';

export function CyberBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const compact = matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 4) <= 4;
    const count = compact ? 16 : 38;
    const points = Array.from({ length: count }, (_, i) => ({ x: ((i * 137.5) % 1000) / 1000, y: ((i * 239.7) % 1000) / 1000, phase: i * .73 }));
    let width = 0, height = 0, frame = 0, last = 0;
    let color = '', textColor = '';
    const pointer = { x: 0, y: 0 };
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const ratio = Math.min(devicePixelRatio, 1.5);
      element.width = width * ratio; element.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const styles = getComputedStyle(document.documentElement);
      color = `hsl(${styles.getPropertyValue('--primary').trim()})`;
      textColor = `hsl(${styles.getPropertyValue('--muted-foreground').trim()})`;
      draw(0);
    };
    const draw = (t: number) => {
      context.clearRect(0, 0, width, height);
      const positions = points.map(p => ({ x: p.x * width + (reduced.matches ? 0 : Math.sin(t * .00012 + p.phase) * 12 + pointer.x * 4), y: p.y * height + (reduced.matches ? 0 : Math.cos(t * .0001 + p.phase) * 12 + pointer.y * 4) }));
      context.strokeStyle = color; context.fillStyle = color; context.lineWidth = .7;
      positions.forEach((p, i) => {
        context.globalAlpha = .2; context.beginPath(); context.arc(p.x, p.y, 1.7, 0, Math.PI * 2); context.fill();
        for (let j = i + 1; j < positions.length; j++) {
          const q = positions[j], distance = Math.hypot(p.x - q.x, p.y - q.y);
          if (distance > (compact ? 160 : 210)) continue;
          context.globalAlpha = .1 * (1 - distance / 230); context.beginPath(); context.moveTo(p.x, p.y); context.lineTo(q.x, q.y); context.stroke();
          if (!compact && !reduced.matches && (i + j) % 5 === 0) {
            const progress = ((t * .00008 + i / count) % 1);
            context.globalAlpha = .25; context.fillRect(p.x + (q.x - p.x) * progress, p.y + (q.y - p.y) * progress, 2, 2);
          }
        }
      });
      context.fillStyle = textColor; context.globalAlpha = .08; context.font = '10px monospace';
      if (!compact) positions.filter((_, i) => i % 9 === 0).forEach((p, i) => context.fillText(`0x${(4096 + i * 128).toString(16)}`, p.x + 8, p.y - 6));
      context.globalAlpha = 1;
    };
    const tick = (t: number) => {
      if (!document.hidden && t - last > (compact ? 65 : 33)) { draw(t); last = t; }
      frame = requestAnimationFrame(tick);
    };
    const start = () => { cancelAnimationFrame(frame); if (reduced.matches) draw(0); else frame = requestAnimationFrame(tick); };
    const move = (e: PointerEvent) => { pointer.x = e.clientX / width - .5; pointer.y = e.clientY / height - .5; };
    const observer = new MutationObserver(resize);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    resize(); start();
    window.addEventListener('resize', resize); reduced.addEventListener('change', start);
    if (!compact) window.addEventListener('pointermove', move, { passive: true });
    const visibility = () => { cancelAnimationFrame(frame); if (!document.hidden) start(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', move); reduced.removeEventListener('change', start); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full"/>;
}

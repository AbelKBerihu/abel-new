import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
export const CustomCursor = () => {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 650, damping: 45 }), smoothY = useSpring(y, { stiffness: 650, damping: 45 });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false), [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (reduced || !matchMedia('(pointer: fine)').matches) return;
    const move = (e: PointerEvent) => { x.set(e.clientX - 10); y.set(e.clientY - 10); setActive(true); setHovered(e.target instanceof Element && !!e.target.closest('a,button,input,textarea,select,summary')); };
    const leave = () => setActive(false);
    window.addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerleave', leave);
    return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); };
  }, [reduced, x, y]);
  if (reduced) return null;
  return <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[70] h-5 w-5 rounded-full border border-primary/70" style={{ x: smoothX, y: smoothY }} animate={{ opacity: active ? 1 : 0, scale: hovered ? 1.6 : 1 }} transition={{ duration: .15 }}/>;
};

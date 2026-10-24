import { motion, useScroll, useSpring } from "framer-motion";

/** Lime signal line that tracks reading progress across the page. */
export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, originX: 0 }}
      className="fixed left-0 right-0 top-0 z-[60] h-[3px] bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
    />
  );
};

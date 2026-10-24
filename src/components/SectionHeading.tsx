import { motion, useReducedMotion } from 'framer-motion';
export function SectionHeading({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 max-w-3xl"><p className="editorial-kicker mb-4">{number}</p><h2 className="text-3xl font-bold md:text-5xl">{title}</h2>{subtitle && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}</motion.div>;
}

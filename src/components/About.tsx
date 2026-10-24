import { usePortfolio, useSettings } from '@/hooks/use-portfolio';
import { SectionHeading } from './SectionHeading';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function About() {
  const { settings } = useSettings();
  const { data = [], isError } = usePortfolio('timeline_items');
  const reduced = useReducedMotion();
  return <section id="about" className="section-rule py-20 md:py-28"><div className="container mx-auto px-4 lg:px-8"><SectionHeading number="01 / My path" title="Curious by nature. Learning by doing."/><div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]"><div><p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{settings.about}</p>{settings.languages && <p className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground">{settings.languages}</p>}<div className="mt-10 border-l-2 border-primary pl-5"><p className="editorial-kicker mb-3">Currently learning</p><p className="leading-relaxed">{settings.currently_learning || 'Cybersecurity, software development and computer networks.'}</p></div></div><div>{isError && <p role="alert">My timeline is temporarily unavailable.</p>}{data.map((item, i) => <motion.article key={item.id} initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * .05, .2) }} viewport={{ once: true }} className="relative border-b border-border py-6 first:pt-0"><div className="flex flex-wrap items-center justify-between gap-3"><p className="editorial-kicker">{item.kind}</p><span className="font-jetbrains text-xs text-muted-foreground">{item.period}</span></div><h3 className="mt-3 text-xl font-semibold">{item.title}</h3>{item.organization && <p className="mt-2 flex items-center gap-2 text-sm"><ArrowUpRight className="h-3 w-3 text-primary"/>{item.organization}</p>}<p className="mt-3 leading-relaxed text-muted-foreground">{item.description}</p></motion.article>)}</div></div></div></section>;
}

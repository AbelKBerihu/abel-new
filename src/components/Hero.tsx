import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useSettings } from '@/hooks/use-portfolio';

export const Hero = () => {
  const reduced = useReducedMotion();
  const { settings } = useSettings();
  return <section className="relative flex min-h-[min(820px,92svh)] items-center overflow-hidden pb-16 pt-32 md:pt-40"><div className="container relative mx-auto px-4 lg:px-8"><motion.div initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75 }} className="max-w-5xl"><p className="mb-7 flex items-center gap-3 text-sm text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary"/>{settings.status || 'Open to internships & learning opportunities'}</p><p className="editorial-kicker mb-5 flex items-center gap-2"><ShieldCheck className="h-4 w-4"/>{settings.hero_role || 'Cybersecurity Student'}</p><h1 className="hero-name font-bold uppercase leading-[1.08]">{settings.hero_name || 'Abel Kebede'}<span className="text-primary">.</span></h1><p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">{settings.hero_intro || 'I’m a cybersecurity student exploring how systems work, how they break, and how to protect them.'}</p><div className="mt-10 flex flex-wrap gap-3"><Button size="lg" asChild><a href="#projects">Explore my work <ArrowDownRight/></a></Button><Button size="lg" variant="outline" asChild><a href="#contact">Get in touch <ArrowUpRight/></a></Button></div><div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6 font-jetbrains text-xs text-muted-foreground"><span>01 / Security</span><span>02 / Development</span><span>03 / Continuous learning</span></div></motion.div></div></section>;
};

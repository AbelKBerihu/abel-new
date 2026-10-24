import { motion, useScroll, useVelocity, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { Github, Linkedin, Send, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings, safeUrl } from '@/hooks/use-portfolio';
import { Button } from './ui/button';

export function Footer() {
  const { settings } = useSettings();
  const social = [
    { name: 'GitHub', icon: Github, href: safeUrl(settings.github_url || 'https://github.com/abelkm99') },
    { name: 'LinkedIn', icon: Linkedin, href: safeUrl(settings.linkedin_url || 'https://www.linkedin.com/in/abel-ks') },
    { name: 'Telegram', icon: Send, href: safeUrl(settings.telegram_url || 'https://t.me/avebina7') },
    { name: 'WhatsApp', icon: MessageCircle, href: safeUrl(settings.whatsapp_url) },
    { name: 'Email', icon: Mail, href: `mailto:${settings.contact_email || 'ks.avebina7@gmail.com'}` },
  ];

  return (
    <footer className="overflow-hidden border-t border-border">
      <KineticWord text={settings.footer_banner || 'ALWAYS LEARNING. ALWAYS BUILDING.'} />
      <div className="container mx-auto px-4 py-10">
        <h3 className="text-center text-xl font-bold">Follow Me</h3>
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
          {social.filter((s) => Boolean(s.href)).map((s) => (
            <Button key={s.name} variant="outline" size="sm" asChild className="whitespace-nowrap min-w-[auto]">
              <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                <s.icon className="h-4 w-4 mr-1" />
                {s.name}
              </a>
            </Button>
          ))}
        </div>
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {settings.hero_name || 'Abel Kebede'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function KineticWord({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const smooth = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const skew = useTransform(smooth, [-2000, 0, 2000], [4, 0, -4]);
  const x = useTransform(scrollY, (v) => -(v * 0.04) % 300);

  return (
    <div className="border-b border-border py-8 md:py-12">
      <motion.div
        style={reduced ? undefined : { x, skewX: skew }}
        className="flex w-max items-center gap-10 font-jetbrains text-3xl font-bold leading-tight md:text-5xl"
        aria-hidden="true"
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i}>
            {text}{' '}
            <Link to="/admin" className="text-primary transition-opacity hover:opacity-60" aria-label="Owner access" tabIndex={-1}>
              ↗
            </Link>
          </span>
        ))}
      </motion.div>
      <span className="sr-only">{text}</span>
    </div>
  );
}

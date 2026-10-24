import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Award, ArrowUpRight, Sparkles, ExternalLink, ZoomIn } from 'lucide-react';
import { usePortfolio, safeUrl } from '@/hooks/use-portfolio';
import { SectionHeading } from './SectionHeading';
import { Button } from './ui/button';
import { ImageModal } from './ui/image-modal';

export const Certifications = () => {
  const { data = [], isError } = usePortfolio('certifications');
  const [modalImage, setModalImage] = useState<{ src: string; alt: string; link?: string | null } | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="section-rule py-20 md:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeading number="03 / Credentials" title="Certifications & training" />
        {isError && <p role="alert">Credentials are temporarily unavailable.</p>}
        <div className="grid md:grid-cols-2">
          {data.map((c, i) => {
            const link = safeUrl(c.credential_url), image = safeUrl(c.image_url);
            const isComingSoon = Boolean(c.coming_soon);

            if (isComingSoon) {
              return (
                <motion.article key={c.id} initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .05 }} className="flex min-w-0 items-start gap-5 border-b border-border py-7 md:pr-8">
                  <Sparkles className="mt-1 h-6 w-6 shrink-0 text-primary/50" />
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-semibold">{c.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{c.issuer}{c.date && c.date !== '—' ? ` · ${c.date}` : ''}</p>
                    <span className="mt-3 inline-block font-jetbrains text-xs uppercase tracking-wider text-primary/60">Coming soon</span>
                  </div>
                </motion.article>
              );
            }

            return (
              <motion.article key={c.id} initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .05 }} className="flex min-w-0 items-start gap-5 border-b border-border py-7 md:pr-8">
                <Award className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.issuer}{c.date && c.date !== '—' ? ` · ${c.date}` : ''}</p>
                  {image && (
                    <div className="mt-4">
                      <button
                        onClick={() => setModalImage({ src: image, alt: `${c.title} certificate`, link })}
                        className="group relative block cursor-pointer overflow-hidden rounded-md border border-border"
                        aria-label={`View ${c.title} certificate`}
                      >
                        <img
                          src={image}
                          alt={`${c.title} certificate`}
                          loading="lazy"
                          className="max-h-48 w-full object-contain transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                          <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        </span>
                      </button>
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Open in new page</span>
                        </a>
                      )}
                    </div>
                  )}
                  {link && <Button size="sm" variant="ghost" asChild className="mt-3"><a href={link} target="_blank" rel="noopener noreferrer">View credential <ArrowUpRight /></a></Button>}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
      <ImageModal
        open={!!modalImage}
        onOpenChange={(open) => !open && setModalImage(null)}
        src={modalImage?.src ?? ''}
        alt={modalImage?.alt ?? ''}
        externalUrl={modalImage?.link ?? null}
        externalLabel="View credential"
      />
    </section>
  );
};
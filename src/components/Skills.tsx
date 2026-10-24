import { motion, animate, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useLanguage } from "@/contexts/LanguageContext";

const SkillItem = ({ name, level, index }: { name: string; level: number; index: number }) => {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? level : 0);
  const [started, setStarted] = useState(false);

  const handleEnter = () => {
    if (started || reduce) return;
    setStarted(true);
    animate(0, level, { duration: 1.2, delay: 0.2 + (index % 2) * 0.1, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setDisplay(Math.round(v)) });
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.08 }}
      viewport={{ once: true, margin: "-60px" }}
      onViewportEnter={handleEnter}
      className="group border-b border-border py-5"
    >
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <span className="font-jetbrains text-sm text-muted-foreground tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex-1 font-medium text-lg transition-transform duration-300 group-hover:translate-x-2">{name}</span>
        <span className="font-jetbrains text-2xl font-bold tabular-nums text-primary">{display}%</span>
      </div>
      <div role="progressbar" aria-label={name} aria-valuenow={level} aria-valuemin={0} aria-valuemax={100} className="h-[3px] bg-secondary overflow-hidden">
        <motion.div
          initial={reduce ? { scaleX: level / 100 } : { scaleX: 0 }}
          whileInView={{ scaleX: level / 100 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          style={{ originX: 0 }}
          className="h-full bg-primary"
        />
      </div>
    </motion.div>
  );
};

const ComingSoonSkill = ({ name, index }: { name: string; index: number }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.08 }}
      viewport={{ once: true, margin: "-60px" }}
      className="group border-b border-dashed border-border py-5"
    >
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <span className="font-jetbrains text-sm text-muted-foreground tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex-1 font-medium text-lg text-muted-foreground">{name}</span>
        <span className="inline-flex items-center gap-1.5 font-jetbrains text-xs text-primary/60">
          <Sparkles className="h-3.5 w-3.5" /> Coming soon
        </span>
      </div>
      <div className="h-[3px] bg-secondary overflow-hidden">
        <div className="h-full w-0" />
      </div>
    </motion.div>
  );
};

export const Skills = () => {
  const reduce = useReducedMotion();
  const { t } = useLanguage();
  const { data: skills = [], isError } = usePortfolio("skills");
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="mb-12 max-w-3xl"
        >
          <p className="editorial-kicker mb-4">04 — {t("skills")}</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{t("skillsTitle")}</h2>
          <p className="text-muted-foreground text-lg">{t("skillsSubtitle")}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-x-12">
          {isError && <p role="alert">Skills are temporarily unavailable.</p>}
          {skills.map((s, i) =>
            s.coming_soon
              ? <ComingSoonSkill key={s.id} name={s.name} index={i} />
              : <SkillItem key={s.id} name={s.name} level={s.level} index={i} />
          )}
        </div>
      </div>
    </section>
  );
};

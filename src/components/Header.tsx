import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { useSettings, safeUrl } from "@/hooks/use-portfolio";
import { ImageModal } from "./ui/image-modal";

const LANGUAGES: { id: Language; label: string; short: string }[] = [
  { id: "English", label: "English", short: "EN" },
  { id: "Amharic", label: "አማርኛ", short: "አማ" },
  { id: "Tigrigna", label: "ትግርኛ", short: "ትግ" },
];

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [showPicture, setShowPicture] = useState(false);

  const links: [string, string][] = [
    ["about", t("about")],
    ["projects", t("projects")],
    ["certifications", t("certifications")],
    ["skills", t("skills")],
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    setOpen(false);
  };

  const profileImage = safeUrl(settings.profile_image);

  const cycleLanguage = () => {
    const idx = LANGUAGES.findIndex((l) => l.id === language);
    const next = LANGUAGES[(idx + 1) % LANGUAGES.length];
    setLanguage(next.id);
  };

  const currentLang = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            {profileImage && (
              <button
                type="button"
                onClick={() => setShowPicture(true)}
                aria-label="View profile picture"
                className="h-8 w-8 overflow-hidden rounded-full border border-primary/50 transition-transform hover:scale-105"
              >
                <img src={profileImage} alt={settings.hero_name || "Abel Kebede"} className="h-full w-full object-cover" />
              </button>
            )}
            <button
              type="button"
              onClick={() => scrollTo("home")}
              onDoubleClick={() => profileImage && setShowPicture(true)}
              className="font-jetbrains text-base font-extrabold uppercase md:text-lg cursor-pointer"
            >
              <span>ABEL</span>
              <span className="text-primary">.</span>
              <span>K</span>
            </button>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-7" aria-label="Main navigation">
              {links.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </nav>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cycleLanguage}
              className="font-jetbrains text-xs gap-1.5 px-2.5"
              aria-label={`Current language: ${currentLang.label}. Click to switch language.`}
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              {currentLang.short}
            </Button>
            <ThemeToggle />
            <Button size="sm" onClick={() => scrollTo("contact")}>
              {t("contact")}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border bg-background md:hidden"
            >
              <nav className="container mx-auto flex flex-col px-4 py-4" aria-label="Mobile navigation">
                {[...links, ["contact", t("contact")]].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => scrollTo(id)}
                    className="border-b border-border py-4 text-left text-sm uppercase last:border-0"
                  >
                    {label}
                  </button>
                ))}
                <div className="mt-3 flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cycleLanguage}
                    className="font-jetbrains text-xs gap-1.5"
                  >
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    {currentLang.label}
                  </Button>
                  <ThemeToggle />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {profileImage && (
        <ImageModal
          open={showPicture}
          onOpenChange={setShowPicture}
          src={profileImage}
          alt={settings.hero_name || "Abel Kebede"}
        />
      )}
    </>
  );
};

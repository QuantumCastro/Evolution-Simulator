import { useStore } from "@nanostores/react";
import { languageAtom, translations } from "../stores/i18n";

export const LandingHero = () => {
  const language = useStore(languageAtom);
  const t = translations[language];

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/40 via-slate-950 to-black p-8 shadow-2xl shadow-emerald-500/20">
      <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">{t.projectLabel}</p>
      <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{t.projectName}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">{t.hero.body}</p>
    </section>
  );
};

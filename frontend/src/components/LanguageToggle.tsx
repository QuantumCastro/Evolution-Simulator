import { useStore } from "@nanostores/react";
import { languageAtom, setLanguage, translations } from "../stores/i18n";

export const LanguageToggle = () => {
  const language = useStore(languageAtom);
  const t = translations[language];

  const baseButton =
    "px-3 py-1 text-xs font-semibold uppercase tracking-wide transition focus:outline-none focus-visible:ring focus-visible:ring-emerald-400/60";

  return (
    <div className="flex justify-end">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-100 shadow-sm shadow-emerald-500/10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-200">{t.languageLabel}</span>
        <div className="flex overflow-hidden rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`${baseButton} ${language === "en" ? "bg-white/20 text-white" : "text-slate-200"}`}
            aria-pressed={language === "en"}
          >
            {t.languageNames.en}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("es")}
            className={`${baseButton} ${language === "es" ? "bg-white/20 text-white" : "text-slate-200"}`}
            aria-pressed={language === "es"}
          >
            {t.languageNames.es}
          </button>
        </div>
      </div>
    </div>
  );
};

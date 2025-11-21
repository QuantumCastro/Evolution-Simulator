import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { languageAtom, translations } from "../stores/i18n";

export const LanguageHead = () => {
  const language = useStore(languageAtom);
  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", t.metaDescription);
    }
  }, [language, t.metaDescription]);

  return null;
};

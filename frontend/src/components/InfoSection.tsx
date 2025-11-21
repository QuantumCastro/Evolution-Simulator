import { useStore } from "@nanostores/react";
import { languageAtom, translations } from "../stores/i18n";

const speciesColors: Record<"circle" | "triangle" | "square" | "pentagon" | "hexagon", string> = {
  circle: "text-cyan-200",
  triangle: "text-fuchsia-200",
  square: "text-emerald-200",
  pentagon: "text-violet-200",
  hexagon: "text-orange-200",
};

export const InfoSection = () => {
  const language = useStore(languageAtom);
  const t = translations[language];

  const species = [
    { key: "circle", copy: t.info.species.circle },
    { key: "triangle", copy: t.info.species.triangle },
    { key: "square", copy: t.info.species.square },
    { key: "pentagon", copy: t.info.species.pentagon },
    { key: "hexagon", copy: t.info.species.hexagon },
  ] as const;

  return (
    <section className="grid gap-6 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-lg sm:grid-cols-2">
      <div>
        <h3 className="text-lg font-semibold text-white">{t.info.speciesTitle}</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {species.map((item) => (
            <li key={item.key}>
              <strong className={speciesColors[item.key]}>{item.copy.split(":")[0]}:</strong>{" "}
              {item.copy.split(":").slice(1).join(":").trim()}
            </li>
          ))}
        </ul>
      </div>
      <div className="sm:pl-4">
        <h3 className="text-lg font-semibold text-white">{t.info.engineTitle}</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {t.info.enginePoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

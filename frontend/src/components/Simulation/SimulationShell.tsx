import { Suspense, lazy } from "react";
import { useStore } from "@nanostores/react";
import { gameStateAtom } from "../../stores/gameStore";
import { languageAtom, translations } from "../../stores/i18n";

const LazySimulation = lazy(() => import("./SimulationCanvas"));

export const SimulationShell = () => {
  const { isPlaying } = useStore(gameStateAtom);
  const language = useStore(languageAtom);
  const t = translations[language];

  if (!isPlaying) {
    return (
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 text-slate-100 shadow-2xl shadow-emerald-500/10">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-emerald-200">{t.simulationShell.lockedBadge}</p>
        <h3 className="text-2xl font-semibold text-white">{t.simulationShell.waitingTitle}</h3>
        <p className="mt-3 text-sm text-slate-300">{t.simulationShell.waitingBody}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-200/80">
          {t.simulationShell.tags.map((tag) => (
            <span key={tag} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-[560px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950 text-slate-100">
          {t.simulationShell.fallback}
        </div>
      }
    >
      <LazySimulation />
    </Suspense>
  );
};

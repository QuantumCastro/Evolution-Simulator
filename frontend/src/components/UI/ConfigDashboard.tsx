import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { Pane } from "tweakpane";
import type { BindingApi, FolderApi, NumberInputParams, TpChangeEvent } from "@tweakpane/core";
import {
  configAtom,
  gameStateAtom,
  type SpeciesId,
  snapshotConfig,
  startSimulation,
  restartSimulation,
  updateConfig,
} from "../../stores/gameStore";
import { languageAtom, translations } from "../../stores/i18n";
import { resyncScrollToSimulation, scrollToSimulation } from "../Simulation/hooks";

let simulationPreloaded = false;

const preloadSimulation = async () => {
  if (simulationPreloaded) return;
  simulationPreloaded = true;
  try {
    await import("../Simulation/SimulationCanvas");
  } catch (error) {
    console.error("No se pudo precargar la simulacion", error);
  }
};

type DashboardParams = {
  mutacion: number;
  gravedad: number;
  densidad: number;
  energiaComida: number;
};

type BindingTarget = Pane | FolderApi;

const bindNumber = <T extends Record<string, number>, K extends keyof T & string>(
  target: BindingTarget,
  params: T,
  key: K,
  options: NumberInputParams,
  onChange: (value: number) => void,
) => {
  const binding = target.addBinding(params, key, options) as BindingApi<T, K>;
  binding.on("change", (event: TpChangeEvent<unknown>) => onChange(Number(event.value)));
  return binding;
};

export const ConfigDashboard = () => {
  const config = useStore(configAtom);
  const { isPlaying } = useStore(gameStateAtom);
  const language = useStore(languageAtom);
  const t = translations[language];
  const paneContainerRef = useRef<HTMLDivElement | null>(null);
  const [paneCollapsed, setPaneCollapsed] = useState(false);
  const initialConfig = useMemo(() => snapshotConfig(), []);

  useEffect(() => {
    void preloadSimulation();
  }, []);

  useEffect(() => {
    if (!paneContainerRef.current) return;

    const pane = new Pane({
      container: paneContainerRef.current,
      title: t.config.panelTitle,
    });

    const params: DashboardParams = {
      mutacion: initialConfig.mutationRate,
      gravedad: initialConfig.gravityWell.strength,
      densidad: initialConfig.food.density,
      energiaComida: initialConfig.food.energyPerFood,
    };

    const paneBinding = pane as unknown as BindingTarget;

    const numberField = (
      key: keyof DashboardParams,
      options: NumberInputParams,
      handler: (value: number) => void,
    ) => bindNumber(paneBinding, params, key, options, handler);

    numberField(
      "mutacion",
      { label: t.config.fields.mutation, min: 0, max: 0.4, step: 0.01 },
      (value) => updateConfig({ mutationRate: value }),
    );

    numberField(
      "gravedad",
      { label: t.config.fields.gravity, min: 80, max: 400, step: 10 },
      (value) => updateConfig({ gravityWell: { strength: value } }),
    );

    numberField(
      "densidad",
      { label: t.config.fields.density, min: 0.05, max: 0.6, step: 0.01 },
      (value) => updateConfig({ food: { density: value } }),
    );

    numberField(
      "energiaComida",
      { label: t.config.fields.foodEnergy, min: 4, max: 40, step: 1 },
      (value) => updateConfig({ food: { energyPerFood: value } }),
    );

    const populationParams: Record<SpeciesId, number> = { ...initialConfig.initialPopulation };
    const populationTarget = pane.addFolder({ title: t.config.fields.populations }) as unknown as BindingTarget;
    const ids: SpeciesId[] = ["circle", "triangle", "square", "pentagon", "hexagon"];

    ids.forEach((key) => {
      bindNumber(
        populationTarget,
        populationParams,
        key,
        { label: t.config.populationLabels[key], min: 4, max: 120, step: 1 },
        (value) => updateConfig({ initialPopulation: { [key]: value } }),
      );
    });

    return () => pane.dispose();
  }, [initialConfig, t]);

  const handleStart = () => {
    const startAction = () => {
      if (isPlaying) {
        restartSimulation();
        return;
      }
      startSimulation();
    };

    void scrollToSimulation().then(() => {
      startAction();
      resyncScrollToSimulation();
    });
  };

  return (
    <section className="grid gap-6 items-start lg:grid-cols-[1.2fr,0.8fr] lg:gap-10">
      <header className="space-y-3 lg:space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/80">{t.config.badge}</p>
        <h1 className="break-words text-3xl font-semibold text-white sm:text-4xl">{t.config.title}</h1>
        <p className="max-w-2xl text-sm text-slate-200 sm:text-base lg:leading-relaxed">{t.config.body}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleStart}
            className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPlaying ? t.config.restart : t.config.start}
          </button>
          <button
            type="button"
            onClick={() => setPaneCollapsed((value) => !value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wide text-slate-100"
          >
            {paneCollapsed ? t.config.show : t.config.minimize}
          </button>
        </div>
        <div className="grid gap-4 text-xs text-slate-200/80 sm:grid-cols-2 lg:gap-5">
          <div className="rounded-lg border border-white/5 bg-white/5 p-3">
            <p className="font-semibold text-emerald-200">{t.config.metrics.poolTitle}</p>
            <p>{t.config.metrics.poolBody.replace("{count}", String(config.poolSize))}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/5 p-3">
            <p className="font-semibold text-cyan-200">{t.config.metrics.preloadTitle}</p>
            <p>{t.config.metrics.preloadBody}</p>
          </div>
        </div>
      </header>

      <aside
        className={`rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4 backdrop-blur lg:p-6 ${
          paneCollapsed ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center justify-between pb-2">
          <p className="text-sm font-semibold text-emerald-100">{t.config.liveControl}</p>
          <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] uppercase tracking-wide text-emerald-200">
            {t.config.runtimeTag}
          </span>
        </div>
        <div
          className="max-w-full overflow-x-auto overflow-y-hidden transition-[max-height] duration-1000 ease-in-out"
          style={{ maxHeight: paneCollapsed ? "0px" : "520px" }}
        >
          <div
            ref={paneContainerRef}
            className={`origin-bottom transition-all duration-700 ease-in-out ${
              paneCollapsed
                ? "pointer-events-none scale-y-90 opacity-0 translate-y-2"
                : "scale-y-100 opacity-100 translate-y-0"
            }`}
          />
        </div>
        <div className="pt-1.5 text-[11px] text-emerald-100/80 lg:leading-relaxed">
          {t.config.hint}
        </div>
      </aside>
    </section>
  );
};

import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { configAtom } from "../../stores/gameStore";
import { languageAtom, translations } from "../../stores/i18n";
import { SimulationEngine } from "./engine";

type Metrics = { alive: number; biomass: number; food: number };

const toWorld = (
  event: PointerEvent,
  host: HTMLElement,
  world: { width: number; height: number },
) => {
  const rect = host.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * world.width;
  const y = ((event.clientY - rect.top) / rect.height) * world.height;
  return { x, y };
};

const initializeCanvasPixels = (host: HTMLElement | null) => {
  const canvas = host?.querySelector("canvas");
  if (!canvas) return;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.objectFit = "cover";
  canvas.style.borderRadius = "18px";
  canvas.style.boxShadow = "0 0 40px rgba(16, 185, 129, 0.2)";
};

const SimulationCanvas = () => {
  const config = useStore(configAtom);
  const language = useStore(languageAtom);
  const t = translations[language];
  const configRef = useRef(config);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<SimulationEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({ alive: 0, biomass: 0, food: 0 });

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    const engine = new SimulationEngine(configRef.current);
    engineRef.current = engine;
    void engine.init(host).then(() => initializeCanvasPixels(host));

    const loop = () => {
      const values = engineRef.current?.getMetrics();
      if (values) setMetrics(values);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const handlePointer = (event: PointerEvent) => {
      if (!host || !engineRef.current) return;
      if (event.button === 2) event.preventDefault();
      const coords = toWorld(event, host, configRef.current.world);
      if (event.button === 2) {
        engineRef.current.gravityPulse(coords);
      } else {
        engineRef.current.spawnBurst(coords);
      }
    };

    const handleContext = (event: Event) => event.preventDefault();
    const handleResize = () => initializeCanvasPixels(host);

    host.addEventListener("pointerdown", handlePointer);
    host.addEventListener("contextmenu", handleContext);
    window.addEventListener("resize", handleResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      host.removeEventListener("pointerdown", handlePointer);
      host.removeEventListener("contextmenu", handleContext);
      window.removeEventListener("resize", handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.updateConfig(config);
  }, [config]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black/70 aspect-[9/16] min-h-[520px] sm:aspect-video sm:min-h-[520px] sm:max-h-[520px] md:max-h-[470px] lg:max-h-[440px]">
      <div className="absolute left-0 top-0 z-10 flex flex-wrap gap-3 p-4 text-xs">
        <span className="rounded-full bg-cyan-500/20 px-3 py-1 font-semibold text-cyan-100">
          {t.simulationCanvas.metrics.alive}: {metrics.alive}
        </span>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-100">
          {t.simulationCanvas.metrics.biomass}: {metrics.biomass}
        </span>
        <span className="rounded-full bg-lime-500/20 px-3 py-1 font-semibold text-lime-100">
          {t.simulationCanvas.metrics.food}: {metrics.food}
        </span>
        <span className="rounded-full bg-fuchsia-500/20 px-3 py-1 font-semibold text-fuchsia-100">
          {t.simulationCanvas.metrics.island}
        </span>
      </div>
      <div className="relative h-full w-full" ref={containerRef} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent p-4 text-[11px] text-slate-200">
        {t.simulationCanvas.interactions.left} {t.simulationCanvas.interactions.right}
      </div>
    </div>
  );
};

export default SimulationCanvas;

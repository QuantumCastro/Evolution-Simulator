import { useEffect, useRef } from "react";
import gsap from "gsap";

const steps = [
  { title: "1. Declarativo", body: "Define layouts con Astro y React usando Tailwind." },
  { title: "2. Imperativo", body: "Acopla timelines GSAP para efectos complejos sin bloquear UI." },
  { title: "3. Optimizado", body: "Entrega assets comprimidos y sin JS innecesario en el HTML base." },
];

export function GsapShowcase() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-step",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 0.9, ease: "power3.out" },
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="glass-panel p-6 sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-white">Timelines GSAP</h3>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          Imperativo
        </span>
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.title} className="gsap-step rounded-lg border border-white/5 bg-white/5 p-3">
            <p className="text-sm font-semibold text-white">{step.title}</p>
            <p className="text-xs text-slate-200">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

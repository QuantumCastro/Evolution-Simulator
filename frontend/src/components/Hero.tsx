import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="glass-panel relative overflow-hidden p-8 sm:p-12">
      <div className="absolute inset-0 bg-grid-radial opacity-60" />
      <div className="relative space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sky-200"
        >
          Astro + React + Motion
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="text-3xl font-bold leading-tight text-white sm:text-5xl"
        >
          Entrega sitios estaticos velozmente, con motion declarativo y assets optimizados.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="max-w-2xl text-base text-slate-200 sm:text-lg"
        >
          Usa Astro para eliminar JS innecesario, React islands para interaccion, Framer Motion para
          UI y GSAP para timelines pesados. Vite Image Optimizer mantiene tus imagenes ligeras.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          {[
            "Astro SSG",
            "React Islands",
            "Tailwind",
            "Framer Motion",
            "GSAP",
            "Vite Image Optimizer",
          ].map((pill) => (
            <span
              key={pill}
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-100"
            >
              {pill}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

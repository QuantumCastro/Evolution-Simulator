import { motion } from "framer-motion";

const features = [
  {
    title: "SSG sin JS extra",
    description: "Astro renderiza HTML estatico y solo hidrata islands donde se requiere interaccion.",
  },
  {
    title: "Motion hibrido",
    description: "Framer para UI declarativa; GSAP para timelines imperativos y scroll-based.",
  },
  {
    title: "Assets livianos",
    description: "Vite Image Optimizer reduce peso de imagenes en build, sin pipelines externos.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {features.map((feature, index) => (
        <motion.article
          key={feature.title}
          className="glass-panel relative overflow-hidden p-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 * index }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-500/5" />
          <div className="relative space-y-2">
            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            <p className="text-sm text-slate-200">{feature.description}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

import { atom } from "nanostores";

export type Language = "en" | "es";

const STORAGE_KEY = "nd-language";

const detectInitialLanguage = (): Language => {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "es") return stored;
  return "en";
};

export const languageAtom = atom<Language>(detectInitialLanguage());

export const setLanguage = (language: Language) => {
  languageAtom.set(language);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, language);
  }
};

export const toggleLanguage = () => {
  const current = languageAtom.get();
  setLanguage(current === "en" ? "es" : "en");
};

export type Translation = {
  projectLabel: string;
  projectName: string;
  languageLabel: string;
  languageNames: Record<Language, string>;
  metaDescription: string;
  hero: {
    badge: string;
    body: string;
  };
  info: {
    speciesTitle: string;
    species: {
      circle: string;
      triangle: string;
      square: string;
      pentagon: string;
      hexagon: string;
    };
    engineTitle: string;
    enginePoints: string[];
  };
  config: {
    badge: string;
    title: string;
    body: string;
    start: string;
    restart: string;
    minimize: string;
    show: string;
    metrics: {
      poolTitle: string;
      poolBody: string;
      preloadTitle: string;
      preloadBody: string;
    };
    panelTitle: string;
    liveControl: string;
    runtimeTag: string;
    hint: string;
    fields: {
      mutation: string;
      gravity: string;
      density: string;
      foodEnergy: string;
      populations: string;
    };
    populationLabels: {
      circle: string;
      triangle: string;
      square: string;
      pentagon: string;
      hexagon: string;
    };
  };
  simulationShell: {
    lockedBadge: string;
    waitingTitle: string;
    waitingBody: string;
    tags: string[];
    fallback: string;
  };
  simulationCanvas: {
    metrics: {
      alive: string;
      biomass: string;
      food: string;
      island: string;
    };
    interactions: {
      left: string;
      right: string;
    };
  };
};

export const translations: Record<Language, Translation> = {
  en: {
    projectLabel: "Project",
    projectName: "Neon Darwinism",
    languageLabel: "Language",
    languageNames: { en: "English", es: "Español" },
    metaDescription: "Neon Darwinism: reactive ALife simulation with two islands, Nano Stores and PixiJS.",
    hero: {
      badge: "Project",
      body:
        "ALife simulation with a strict split between the configuration phase and the execution phase. " +
        "The lightweight panel (client:load) preloads in the background the heavy simulation island " +
        '(client:only="react") powered by PixiJS + Nano Stores + object pooling. The simulation JS is ' +
        "neither downloaded nor hydrated until you press Start.",
    },
    info: {
      speciesTitle: "Species and behavior",
      species: {
        circle: "Circles: herbivores that flee from Triangles/Hexagons.",
        triangle: "Triangles: fast predators with low health.",
        square: "Squares: slow guardians, they regenerate energy while idle.",
        pentagon: "Pentagons: decomposers of grey biomass.",
        hexagon: "Hexagons: armored omnivores, territorial.",
      },
      engineTitle: "Engine",
      enginePoints: [
        "Pixi v8 + @pixi/filter-advanced-bloom over a #000 background.",
        "Simple Euler integration, mandatory quadtree, fixed object pool.",
        "Procedural Web Audio for spawn, eat and death with filtering.",
        "Clicks: left = spawn, right = gravity well based on the panel strength.",
      ],
    },
    config: {
      badge: "Neon Darwinism",
      title: "Geometric ecosystem, gravity well and controlled mutations.",
      body:
        "The configuration phase is ultra light and triggers the Pixi engine preload in the background. " +
        "Adjust mutation, gravity and food density; when you press START the simulation island hydrates without flashes.",
      start: "Start",
      restart: "Re-start",
      minimize: "Minimize Panel",
      show: "Show Panel",
      metrics: {
        poolTitle: "Pool",
        poolBody: "Fixed pool to avoid GC: {count} entities.",
        preloadTitle: "Preload",
        preloadBody: "Pixi + engine download while idle thanks to dynamic import.",
      },
      panelTitle: "Darwinist Panel",
      liveControl: "Live control",
      runtimeTag: "client:load",
      hint:
        "The panel persists during the simulation; change mutation or the gravity well strength in real time with Nano Stores propagating to the engine.",
      fields: {
        mutation: "Mutation",
        gravity: "Gravity well",
        density: "Food %",
        foodEnergy: "Food energy",
        populations: "Initial populations",
      },
      populationLabels: {
        circle: "Circle",
        triangle: "Triangle",
        square: "Square",
        pentagon: "Pentagon",
        hexagon: "Hexagon",
      },
    },
    simulationShell: {
      lockedBadge: "Phase 2 locked",
      waitingTitle: "Simulation on hold",
      waitingBody:
        "The heavy island (React + Pixi) hydrates after pressing Start. Meanwhile we stay on the landing without extra JS.",
      tags: ["SSG render", "Preload engine"],
      fallback: "Loading simulation engine.",
    },
    simulationCanvas: {
      metrics: {
        alive: "Alive",
        biomass: "Biomass",
        food: "Food",
        island: "React island (client:only)",
      },
      interactions: {
        left: "Left click: spawn nearby entities.",
        right: "Right click: gravity well (uses strength from the panel).",
      },
    },
  },
  es: {
    projectLabel: "Proyecto",
    projectName: "Neon Darwinism",
    languageLabel: "Idioma",
    languageNames: { en: "English", es: "Español" },
    metaDescription: "Neon Darwinism: simulación ALife reactiva con dos islas, Nano Stores y PixiJS.",
    hero: {
      badge: "Proyecto",
      body:
        "Simulación ALife con estricta separación entre la fase de configuración y la fase de ejecución. " +
        "El panel ligero (client:load) precarga en segundo plano la isla pesada de simulación " +
        '(client:only="react") que usa PixiJS + Nano Stores + object pooling. El JS de la simulación ' +
        "no se descarga ni se hidrata hasta que pulses Start.",
    },
    info: {
      speciesTitle: "Especies y conducta",
      species: {
        circle: "Círculos: herbívoros que huyen de Triángulos/Hexágonos.",
        triangle: "Triángulos: depredadores rápidos con poca salud.",
        square: "Cuadrados: guardianes lentos, regeneran energía quietos.",
        pentagon: "Pentágonos: descomponedores de biomasa gris.",
        hexagon: "Hexágonos: omnívoros acorazados, territoriales.",
      },
      engineTitle: "Motor",
      enginePoints: [
        "Pixi v8 + filtro @pixi/filter-advanced-bloom sobre fondo #000.",
        "Integración Euler simple, quadtree obligatorio, pool de objetos fijo.",
        "Audio WebAPI procedural para nacimiento, consumo y muerte filtrado.",
        "Clicks: izquierdo = spawn, derecho = gravity well según panel.",
      ],
    },
    config: {
      badge: "Neon Darwinism",
      title: "Ecosistema geométrico, pozo gravitacional y mutaciones controladas.",
      body:
        "La fase de configuración es ultraligera y dispara la precarga del motor PIXI en segundo plano. " +
        "Ajusta mutación, gravedad y densidad de comida; al presionar START se hidrata la isla de simulación sin flashes.",
      start: "Iniciar",
      restart: "Reiniciar",
      minimize: "Minimizar Panel",
      show: "Mostrar Panel",
      metrics: {
        poolTitle: "Pool",
        poolBody: "Reserva fija para evitar GC: {count} entidades.",
        preloadTitle: "Precarga",
        preloadBody: "Pixi + motor se descargan en idle gracias al import dinámico.",
      },
      panelTitle: "Panel Darwinista",
      liveControl: "Control en vivo",
      runtimeTag: "client:load",
      hint:
        "El panel persiste durante la simulación; modifica mutación o pozo gravitacional en tiempo real con Nano Stores propagando al motor.",
      fields: {
        mutation: "Mutación",
        gravity: "Pozo gravedad",
        density: "Food %",
        foodEnergy: "Energía comida",
        populations: "Poblaciones iniciales",
      },
      populationLabels: {
        circle: "Círculo",
        triangle: "Triángulo",
        square: "Cuadrado",
        pentagon: "Pentágono",
        hexagon: "Hexágono",
      },
    },
    simulationShell: {
      lockedBadge: "Fase 2 bloqueada",
      waitingTitle: "Simulación en espera",
      waitingBody:
        "La isla pesada (React + Pixi) se hidratará al pulsar Start. Mientras tanto seguimos en la landing sin JS extra.",
      tags: ["Render SSG", "Precarga motor"],
      fallback: "Cargando motor de simulación.",
    },
    simulationCanvas: {
      metrics: {
        alive: "Vivos",
        biomass: "Biomasa",
        food: "Comida",
        island: "Isla React (client:only)",
      },
      interactions: {
        left: "Click izquierdo: spawnea entidades cercanas.",
        right: "Click derecho: pozo gravitacional (usa la fuerza configurada en el panel).",
      },
    },
  },
};

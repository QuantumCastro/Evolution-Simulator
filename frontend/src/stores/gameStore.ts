import { atom } from "nanostores";

export type SpeciesId = "circle" | "triangle" | "square" | "pentagon" | "hexagon";

export type Genome = {
  speed: number;
  size: number;
  vision: number;
  metabolism: number;
};

export type SpeciesSettings = {
  color: number;
  highlight: number;
  baseGenome: Genome;
  reproductionThreshold: number;
  energyGain: number;
  energyLossPerSecond: number;
  aggression: number;
  diet: "plants" | "herbivore" | "any";
};

export type SimulationConfig = {
  world: {
    width: number;
    height: number;
    wrapAround: boolean;
    friction: number;
    background: string;
    bloomStrength: number;
  };
  poolSize: number;
  initialPopulation: Record<SpeciesId, number>;
  mutationRate: number;
  gravityWell: {
    strength: number;
    radius: number;
  };
  food: {
    density: number;
    energyPerFood: number;
  };
  species: Record<SpeciesId, SpeciesSettings>;
};

export type GameState = {
  isPlaying: boolean;
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

const baseGenome = (overrides: Partial<Genome>): Genome => ({
  speed: 40,
  size: 6,
  vision: 110,
  metabolism: 2.2,
  ...overrides,
});

const initialConfig: SimulationConfig = {
  world: {
    width: 1600,
    height: 900,
    wrapAround: true,
    friction: 0.98,
    background: "#000000",
    bloomStrength: 0.9,
  },
  poolSize: 420,
  initialPopulation: {
    circle: 120,
    triangle: 4,
    square: 4,
    pentagon: 120,
    hexagon: 4,
  },
  mutationRate: 0.08,
  gravityWell: {
    strength: 240,
    radius: 180,
  },
  food: {
    density: 0.22,
    energyPerFood: 16,
  },
  species: {
    circle: {
      color: 0x00e5ff,
      highlight: 0x6ff6ff,
      baseGenome: baseGenome({ speed: 55, size: 8, metabolism: 1.8 }),
      reproductionThreshold: 42,
      energyGain: 11,
      energyLossPerSecond: 3,
      aggression: 0.1,
      diet: "plants",
    },
    triangle: {
      color: 0xff2fd0,
      highlight: 0xf495ff,
      baseGenome: baseGenome({ speed: 82, size: 10, metabolism: 3.8 }),
      reproductionThreshold: 60,
      energyGain: 21,
      energyLossPerSecond: 5,
      aggression: 0.96,
      diet: "herbivore",
    },
    square: {
      color: 0x38ef7d,
      highlight: 0xa0ffcb,
      baseGenome: baseGenome({ speed: 12, size: 12, metabolism: 0.8 }),
      reproductionThreshold: 28,
      energyGain: 6,
      energyLossPerSecond: 1,
      aggression: 0.05,
      diet: "plants",
    },
    pentagon: {
      color: 0x9b5cff,
      highlight: 0xd2b3ff,
      baseGenome: baseGenome({ speed: 38, size: 10, metabolism: 1.6 }),
      reproductionThreshold: 32,
      energyGain: 15,
      energyLossPerSecond: 3,
      aggression: 0.22,
      diet: "any",
    },
    hexagon: {
      color: 0xff8f3f,
      highlight: 0xffc483,
      baseGenome: baseGenome({ speed: 26, size: 14, metabolism: 2.8 }),
      reproductionThreshold: 70,
      energyGain: 18,
      energyLossPerSecond: 3.2,
      aggression: 0.4,
      diet: "any",
    },
  },
};

const mergeConfig = <T extends Record<string, unknown>>(target: T, delta: DeepPartial<T>): T => {
  const output: Record<string, unknown> = { ...target };

  Object.entries(delta).forEach(([key, value]) => {
    const current = output[key];

    if (Array.isArray(value)) {
      output[key] = value;
      return;
    }

    if (value && typeof value === "object" && current && typeof current === "object") {
      output[key] = mergeConfig(current as Record<string, unknown>, value as Record<string, unknown>);
      return;
    }

    if (value !== undefined) {
      output[key] = value;
    }
  });

  return output as T;
};

export const configAtom = atom<SimulationConfig>(initialConfig);
export const gameStateAtom = atom<GameState>({ isPlaying: false });

export const startSimulation = () => {
  gameStateAtom.set({ isPlaying: true });
};

export const stopSimulation = () => {
  gameStateAtom.set({ isPlaying: false });
};

export const restartSimulation = () => {
  gameStateAtom.set({ isPlaying: false });
  requestAnimationFrame(() => gameStateAtom.set({ isPlaying: true }));
};

export const resetConfig = () => {
  configAtom.set(initialConfig);
};

export const updateConfig = (delta: DeepPartial<SimulationConfig>) => {
  const nextConfig = mergeConfig(configAtom.get(), delta);
  configAtom.set(nextConfig);
};

export const snapshotConfig = () => configAtom.get();

export const snapshotGameState = () => gameStateAtom.get();

export type EngineBootstrap = {
  config: SimulationConfig;
  startedAt: number;
};

export const createEngineBootstrap = (): EngineBootstrap => ({
  config: configAtom.get(),
  startedAt: performance.now(),
});

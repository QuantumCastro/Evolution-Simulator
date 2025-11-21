# Architecture Overview - Neon Darwinism

## High-level
- Astro SSG with two React islands:
  - `ConfigDashboard` (`client:load`): fast hydration, Tweakpane controls, updates Nano Stores, preloads the simulation bundle in the background, smooth-scrolls to the sim on start/restart.
  - `SimulationShell/SimulationCanvas` (`client:only="react"`): React.lazy + Suspense; mounts Pixi v8 when `isPlaying` is true.
- Shared store (`src/stores/gameStore.ts`): world/species/mutation/gravity/food config and `isPlaying` state. Default populations biased to Circle/Pentagon (120) and minimal for others (4).
- Pixi engine (`src/components/Simulation/engine.ts`):
  - Object pooling for entities.
  - Quadtree for vision/collision queries.
  - Euler integration, optional wrap-around.
  - Bloom neon visuals; energy maps to tint/alpha/scale.
  - Food spawns in rotating hotspots; biomass (dead bodies) is edible by any species (50% food value).
  - Squares conserve energy when idle and spend less while moving.
  - Web Audio API for birth/eat/death.
- i18n: EN/ES toggle with persistent choice and dynamic meta description.
- Dev toolbar: explicitly disabled to keep UI clean during development.

## Load flow
1) Astro serves HTML/CSS + light bundle for `ConfigDashboard`.
2) `ConfigDashboard` mounts and triggers `import("../Simulation/SimulationCanvas")` in idle (downloads Pixi/engine).
3) User tweaks sliders/populations → `configAtom` updates live.
4) Start click → smooth scroll to simulation → `isPlaying=true`.
5) `SimulationShell` detects state, lazy module is already cached, and mounts `SimulationCanvas`.
6) `SimulationEngine` initializes with a snapshot of `configAtom`; Pixi loop begins.

## User interactions
- Left click: `spawnBurst` near cursor (species random unless specified).
- Right click: `gravityPulse` with strength from the panel.
- Panel runtime updates feed Nano Stores; engine polls config each tick (`updateConfig`).

## Data & config
- No backend. All config lives in `gameStore.ts`.
- Species: circle (herbivore), triangle (predator), square (guardian low-loss), pentagon (decomposer), hexagon (armored omnivore).
- World: black background, wrap-around, bloom, hotspot-driven food regeneration, biomass as secondary food source.

## Export & deploy
- `pnpm --dir frontend build` → `frontend/dist`.
- Deploy static output to Vercel or any static host.***

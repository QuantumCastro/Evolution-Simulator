# Neon Darwinism

Static A-Life demo built with Astro (SSG) + React islands + PixiJS. The site ships two islands: a lightweight landing/config panel (`client:load`) and a heavy simulation island (`client:only="react"`). Shared config lives in Nano Stores; the Pixi engine uses object pooling, quadtree visibility, bloom, and hotspot-based food spawning. Dead bodies become edible biomass worth half a normal food.

## Prerequisites
- Node.js ≥ 20.10
- pnpm ≥ 9
- Optional: Sharp if you enable Vite Image Optimizer (`ENABLE_IMAGE_OPTIMIZER=true`; requires `pnpm approve-builds sharp`).

## Quickstart
```pnpm
pnpm install
pnpm --dir frontend dev
```
Static output: `frontend/dist` after `pnpm --dir frontend build`.

## Key scripts
- `pnpm --dir frontend dev` — Astro dev server.
- `pnpm --dir frontend lint` — ESLint.
- `pnpm --dir frontend type-check` — `astro check`.
- `pnpm --dir frontend test` — Vitest (no default suites).
- `pnpm --dir frontend build` — SSG build.

## Architecture snapshot
- **ConfigDashboard island (`client:load`)**: Tweakpane sliders (mutation, gravity, food density/energy) + initial populations. Triggers simulation preload via dynamic import. Start button scrolls to the simulation, then starts/restarts (restart remounts Pixi to apply config).
- **Simulation island (`client:only="react"`)**: React.lazy + Suspense; Pixi v8 render. Behaviors: object pooling, quadtree, Euler integration, wrap-around, hotspots for food respawn, biomass attracts all species and yields 50% food energy. Squares don’t lose energy when idle and lose only a fraction while moving.
- **Global state (`src/stores/gameStore.ts`)**: Nano Stores for config and `isPlaying`. Default populations: Circle 120, Pentagon 120, Triangle/Square/Hexagon 4.
- **Audio**: Web Audio API for birth/eat/death events.
- **Styling/i18n**: Tailwind + neon gradients; language toggle (EN/ES) with persistent choice; meta description updates per language.
- **Dev DX**: Astro dev toolbar disabled in config; lint/type gates via scripts.

## Structure
- `frontend/src/pages/index.astro` — mounts LanguageToggle, LandingHero, ConfigDashboard, SimulationShell, InfoSection.
- `frontend/src/components/UI/ConfigDashboard.tsx` — landing copy, Tweakpane panel, start/restart logic with smooth scroll.
- `frontend/src/components/Simulation/SimulationShell.tsx` / `SimulationCanvas.tsx` — lazy load + Pixi engine mount.
- `frontend/src/components/Simulation/engine.ts` — core loop, pooling, food hotspots, biomass, gravity wells.
- `frontend/src/stores/gameStore.ts` — config/state atoms.
- `docs/adr/`, `docs/architecture/`, `docs/worklog/` — decisions and log.

## Performance and DX goals
- Keep landing LCP fast: simulation bundle preloaded in idle, only hydrated after Start.
- Minimal JS on landing; heavy deps lazy-loaded. Pooling to avoid GC spikes; quadtree for scale.
- Stringent typing/lint scripts as local gates.

## Troubleshooting
- **Tailwind styles missing**: check `frontend/tailwind.config.ts` and `src/styles/global.css` import.
- **Sharp errors**: Image Optimizer is off by default; enable only with approved builds.
- **Bundle weight**: keep optional heavy deps out; no 3D packages included.

## Deploy
Run `pnpm --dir frontend build` and deploy `frontend/dist` (e.g., Vercel).***

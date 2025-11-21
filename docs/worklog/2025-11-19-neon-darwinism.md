# Worklog 2025-11-19 - Neon Darwinism

## Goal
Document decisions and implementation state after splitting islands, wiring the Pixi engine, and adding UX polish (i18n, hotspots, biomass).

## What happened
- Built `ConfigDashboard` (`client:load`) with Tweakpane and dynamic preload of the simulation bundle; start triggers smooth scroll + play, restart remounts Pixi to apply new config.
- Implemented `SimulationShell/SimulationCanvas` (`client:only="react"`) mounting Pixi v8 with pooling, quadtree, Web Audio, wrap-around world.
- Engine updates: hotspot-based food spawning; dead bodies become biomass edible by any species (50% food value); squares conserve energy when idle and lose less when moving.
- Global store `gameStore.ts` holds world/species config and `isPlaying`; default populations set to Circle/Pentagon 120, Triangle/Square/Hexagon 4.
- i18n added (EN/ES) with persistent language toggle and dynamic meta description.
- ADR 0001 recorded; architecture overview and README refreshed for dev-facing guidance.

## Risks / TODO
- Image Optimizer remains optional (sharp approval required); keep disabled unless needed.
- Add unit tests for store helpers and quadtree when time permits; add perf guardrails for mutation extremes.

## Next steps
- Run `pnpm --dir frontend lint && pnpm --dir frontend build` before publishing.
- Tune species parameters if population oscillations become unstable; revisit hotspot cadence if food feels too bursty.***

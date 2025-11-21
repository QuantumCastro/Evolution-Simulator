# ADR 0001 - Neon Darwinism Architecture (Astro + React islands + Pixi)

- Status: Accepted
- Date: 2025-11-19

## Context
- A-Life simulation must ship as a fully static Astro site.
- Landing LCP/TTFB must stay low; the heavy simulation should only load on demand.
- Configuration needs to be shared between the landing island and the simulation island.
- Visual language is neon; runtime controls are required without any backend.

## Decisions
1) **Split islands**: `ConfigDashboard` (`client:load`) and `SimulationShell/SimulationCanvas` (`client:only="react"`). The first preloads the heavy bundle via dynamic `import()` and only flips `isPlaying` on user start.
2) **Shared state**: Nano Stores (`configAtom`, `gameStateAtom`) expose configuration and play state to both islands without prop drilling.
3) **Render engine**: PixiJS v8 with `@pixi/filter-advanced-bloom`, object pooling, quadtree for visibility/collisions, Euler integration, wrap-around world.
4) **Runtime panel**: Tweakpane sliders for mutation, gravity well, food density/energy, and initial populations. Start triggers preload + smooth scroll; restart remounts Pixi to reapply config.
5) **Data model**: Static config in `src/stores/gameStore.ts`; no runtime fetching. Default populations set to circle/pentagon high (120) and triangle/square/hexagon low (4).
6) **Load optimization**: Simulation bundle preloads in idle; React.lazy + Suspense for immediate mount after `isPlaying` goes true.
7) **Ecosystem tweaks**: Food respawns in moving hotspots; dead bodies become biomass edible by any species (worth 50% of a food). Squares don’t lose energy when idle and lose reduced energy when moving.
8) **DX/UX**: Language toggle (EN/ES) with persisted choice; Astro dev toolbar disabled to keep UI clean during dev.

## Consequences
- Landing ships minimal JS; Pixi and heavy deps download only after Start.
- Engine depends on modern browsers (Web Audio API and canvas).
- SSG compatibility preserved; final artifact is `frontend/dist`.
- Contract in `gameStore.ts` must stay in sync when adding species/rules.***

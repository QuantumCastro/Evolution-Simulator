import { Container, Graphics } from "pixi.js";
import type { Genome, SimulationConfig, SpeciesId, SpeciesSettings } from "../../stores/gameStore";

export type EntityState = "inactive" | "alive" | "biomass";

export type Entity = {
  id: number;
  species: SpeciesId;
  genome: Genome;
  energy: number;
  state: EntityState;
  x: number;
  y: number;
  vx: number;
  vy: number;
  view: Graphics;
  lastAte: number;
  birth: number;
};

const mutateGene = (value: number, mutationRate: number) => {
  const variance = 1 + (Math.random() * 2 - 1) * mutationRate;
  return Math.max(0.1, value * variance);
};

const mutateGenome = (genome: Genome, mutationRate: number): Genome => ({
  speed: mutateGene(genome.speed, mutationRate),
  size: mutateGene(genome.size, mutationRate),
  vision: mutateGene(genome.vision, mutationRate),
  metabolism: mutateGene(genome.metabolism, mutationRate),
});

const drawShape = (view: Graphics, species: SpeciesId, size: number, color: number) => {
  view.clear();

  switch (species) {
    case "circle":
      view.circle(0, 0, size);
      break;
    case "triangle":
      view.poly([0, -size, size, size, -size, size]);
      break;
    case "square":
      view.rect(-size, -size, size * 2, size * 2);
      break;
    case "pentagon": {
      const path: number[] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (-90 + i * 72) * (Math.PI / 180);
        path.push(Math.cos(angle) * size, Math.sin(angle) * size);
      }
      view.poly(path);
      break;
    }
    case "hexagon": {
      const path: number[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (-90 + i * 60) * (Math.PI / 180);
        path.push(Math.cos(angle) * size, Math.sin(angle) * size);
      }
      view.poly(path);
      break;
    }
  }

  view.fill({ color });
  view.stroke({ width: 1.5, color, alpha: 0.9 });
  view.pivot.set(0, 0);
};

const palette = {
  biomass: 0x7f7f7f,
};

export class EntityPool {
  private readonly entities: Entity[];
  private readonly stage: Container;
  private free: number[] = [];

  constructor(stage: Container, poolSize: number) {
    this.stage = stage;
    this.entities = Array.from({ length: poolSize }, (_, index) => {
      const view = new Graphics();
      view.visible = false;
      return {
        id: index,
        species: "circle" as SpeciesId,
        genome: { speed: 0, size: 0, vision: 0, metabolism: 0 },
        energy: 0,
        state: "inactive",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        view,
        lastAte: 0,
        birth: 0,
      };
    });

    this.free = this.entities.map((entity) => entity.id);
  }

  spawn(
    species: SpeciesId,
    config: SimulationConfig,
    now: number,
    position?: { x: number; y: number },
  ): Entity | null {
    const slot = this.free.pop();
    if (slot === undefined) return null;

    const entity = this.entities[slot];
    const settings = config.species[species];
    const genome = mutateGenome(settings.baseGenome, config.mutationRate);

    entity.species = species;
    entity.genome = genome;
    entity.energy = settings.reproductionThreshold * 0.6;
    entity.state = "alive";
    entity.x = position?.x ?? Math.random() * config.world.width;
    entity.y = position?.y ?? Math.random() * config.world.height;
    entity.vx = (Math.random() * 2 - 1) * genome.speed;
    entity.vy = (Math.random() * 2 - 1) * genome.speed;
    entity.lastAte = now;
    entity.birth = now;

    this.applyVisual(entity, settings);

    if (!entity.view.parent) this.stage.addChild(entity.view);

    entity.view.visible = true;
    entity.view.alpha = 1;

    return entity;
  }

  markBiomass(entity: Entity) {
    entity.state = "biomass";
    entity.energy = Math.max(entity.energy, 4);
    entity.vx = 0;
    entity.vy = 0;
    entity.view.tint = palette.biomass;
    entity.view.alpha = 0.65;
  }

  recycle(entity: Entity) {
    entity.state = "inactive";
    entity.view.visible = false;
    this.free.push(entity.id);
  }

  getEntities() {
    return this.entities;
  }

  applyVisual(entity: Entity, settings: SpeciesSettings) {
    drawShape(entity.view, entity.species, settings.baseGenome.size, settings.color);
    entity.view.tint = settings.color;
    entity.view.alpha = 0.92;
  }
}

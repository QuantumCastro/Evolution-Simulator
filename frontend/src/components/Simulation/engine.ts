import { Application, Container, Graphics, type Filter } from "pixi.js";
import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom";
import type { SimulationConfig, SpeciesId } from "../../stores/gameStore";
import { EntityPool } from "./entities";
import type { Entity } from "./entities";
import { Quadtree } from "./quadtree";
import { NeonAudio } from "./audio";

type Food = { x: number; y: number; energy: number };
type Hotspot = { x: number; y: number; radius: number; expiresAt: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const lerpColor = (a: number, b: number, t: number) => {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;

  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);

  return (rr << 16) + (rg << 8) + rb;
};

const distanceSq = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

export class SimulationEngine {
  private app: Application | null = null;
  private foodLayer: Graphics | null = null;
  private entityPool: EntityPool | null = null;
  private quadtree: Quadtree<Entity> | null = null;
  private tickerBound?: (ticker: { deltaMS: number; lastTime: number }) => void;
  private foods: Food[] = [];
  private config: SimulationConfig;
  private audio = new NeonAudio();
  private metrics = { alive: 0, biomass: 0, food: 0 };
  private time = 0;
  private hotspot: Hotspot = { x: 0, y: 0, radius: 120, expiresAt: 0 };

  constructor(config: SimulationConfig) {
    this.config = config;
  }

  async init(host: HTMLElement) {
    const app = new Application();
    await app.init({
      width: this.config.world.width,
      height: this.config.world.height,
      antialias: true,
      background: this.config.world.background,
      resolution: Math.min(window.devicePixelRatio, 2),
    });

    const layer = new Container();
    const foodLayer = new Graphics();
    const bloom = new AdvancedBloomFilter({
      threshold: 0.35,
      bloomScale: this.config.world.bloomStrength,
    }) as unknown as Filter;

    layer.filters = [bloom];
    app.stage.addChild(foodLayer);
    app.stage.addChild(layer);

    this.app = app;
    this.foodLayer = foodLayer;

    host.innerHTML = "";
    host.appendChild(app.canvas);

    this.entityPool = new EntityPool(layer, this.config.poolSize);
    this.quadtree = new Quadtree(
      { x: 0, y: 0, width: this.config.world.width, height: this.config.world.height },
      10,
    );

    this.seedWorld(performance.now());

    this.tickerBound = ({ deltaMS, lastTime }) => this.step(deltaMS / 1000, lastTime);
    app.ticker.add(this.tickerBound);
  }

  destroy() {
    this.app?.destroy(true, { children: true, texture: true });
    this.app = null;
    this.foodLayer = null;
    this.entityPool = null;
    this.quadtree = null;
  }

  getMetrics() {
    return this.metrics;
  }

  updateConfig(config: SimulationConfig) {
    this.config = config;
  }

  spawnBurst(position: { x: number; y: number }, species?: SpeciesId) {
    if (!this.entityPool) return;
    const ids: SpeciesId[] = ["circle", "triangle", "square", "pentagon", "hexagon"];
    const chosen = species ?? ids[Math.floor(Math.random() * ids.length)];
    const now = performance.now();
    for (let i = 0; i < 3; i++) {
      const entity = this.entityPool.spawn(chosen, this.config, now, {
        x: position.x + Math.random() * 30 - 15,
        y: position.y + Math.random() * 30 - 15,
      });
      if (entity) this.audio.playBirth(entity.energy);
    }
  }

  gravityPulse(position: { x: number; y: number }) {
    if (!this.entityPool) return;
    const radius = this.config.gravityWell.radius;
    const strength = this.config.gravityWell.strength;
    for (const entity of this.entityPool.getEntities()) {
      if (entity.state !== "alive") continue;
      const dx = position.x - entity.x;
      const dy = position.y - entity.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > radius * radius) continue;
      const distance = Math.sqrt(distSq) + 1e-5;
      entity.vx += (dx / distance) * strength * 0.5;
      entity.vy += (dy / distance) * strength * 0.5;
    }
  }

  private seedWorld(now: number) {
    if (!this.entityPool) return;
    const counts = this.config.initialPopulation;
    (Object.keys(counts) as SpeciesId[]).forEach((species) => {
      for (let i = 0; i < counts[species]; i++) {
        this.entityPool?.spawn(species, this.config, now);
      }
    });

    const foodTotal = Math.max(
      16,
      Math.round(
        (this.config.world.width * this.config.world.height * this.config.food.density) / 10000,
      ),
    );

    this.foods = Array.from({ length: foodTotal }, () => ({
      x: Math.random() * this.config.world.width,
      y: Math.random() * this.config.world.height,
      energy: this.config.food.energyPerFood,
    }));
  }

  private step(dt: number, now: number) {
    if (!this.entityPool || !this.quadtree || !this.foodLayer) return;

    this.time += dt;
    this.quadtree.clear();
    for (const entity of this.entityPool.getEntities()) {
      if (entity.state !== "inactive") {
        this.quadtree.insert({ x: entity.x, y: entity.y, data: entity });
      }
    }

    let aliveCount = 0;
    let biomassCount = 0;

    for (const entity of this.entityPool.getEntities()) {
      if (entity.state === "inactive") continue;
      const settings = this.config.species[entity.species];
      if (entity.state === "alive") aliveCount += 1;
      if (entity.state === "biomass") biomassCount += 1;

      if (entity.state === "alive") {
        this.updateBehavior(entity, settings, dt, now);
        this.applyMovement(entity, dt);
      } else if (entity.state === "biomass") {
        entity.energy -= dt * 2;
        if (entity.energy <= -4) this.entityPool.recycle(entity);
      }

      this.updateVisual(entity, settings);
    }

    this.handleFood(dt);
    this.metrics = {
      alive: aliveCount,
      biomass: biomassCount,
      food: this.foods.length,
    };
  }

  private updateBehavior(entity: Entity, settings: SimulationConfig["species"][SpeciesId], dt: number, now: number) {
    const baseLoss = (settings.energyLossPerSecond + entity.genome.metabolism) * dt;
    const velMag = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
    const movementLoss =
      entity.species === "square" ? (velMag < 2 ? 0 : baseLoss * 0.4) : baseLoss;
    entity.energy -= movementLoss;

    const neighbors = this.quadtree?.queryRadius(entity.x, entity.y, entity.genome.vision) ?? [];
    let target: Entity | null = null;
    let biomassTarget: { entity: Entity; distSq: number } | null = null;
    let targetFood: Food | null = null;

    if (settings.diet === "plants" || settings.diet === "any") {
      targetFood = this.findClosestFood(entity);
      if (targetFood) this.seek(entity, targetFood, settings);
    }

    for (const neighbor of neighbors) {
      const other = neighbor.data;
      if (other.id === entity.id) continue;
      const distSqVal = distanceSq(entity, other);

      if (other.state === "biomass") {
        if (!biomassTarget || distSqVal < biomassTarget.distSq) {
          biomassTarget = { entity: other, distSq: distSqVal };
        }
        continue;
      }

      if (other.state !== "alive") continue;
      const combined = (entity.genome.size + other.genome.size + 6) ** 2;

      if (entity.species === "circle" && (other.species === "triangle" || other.species === "hexagon")) {
        this.flee(entity, other, settings);
      }

      if (entity.species === "triangle" && other.species === "circle") {
        if (!target || distSqVal < distanceSq(entity, target)) {
          target = other;
        }
      }

      if (entity.species === "hexagon" && other.species === "circle") {
        if (!target || distSqVal < distanceSq(entity, target)) {
          target = other;
        }
      }

      if (settings.aggression > 0.3 && distSqVal < combined * 2) {
        entity.vx += (entity.x - other.x) * 0.04;
        entity.vy += (entity.y - other.y) * 0.04;
      }
    }

    const chaseTarget = biomassTarget?.entity ?? target;

    if (chaseTarget) {
      this.seek(entity, chaseTarget, settings);
      const eatRadius = (entity.genome.size + chaseTarget.genome.size) ** 2;
      if (distanceSq(entity, chaseTarget) < eatRadius) {
        this.consume(entity, chaseTarget, now);
      }
    }

    if (targetFood) {
      const eatRadius = (entity.genome.size + 6) ** 2;
      if (distanceSq(entity, targetFood) < eatRadius) {
        entity.energy += this.config.food.energyPerFood;
        targetFood.energy = 0;
        entity.lastAte = now;
        this.audio.playConsume(entity.energy);
      }
    }

    const maxSpeed = settings.baseGenome.speed;
    if (velMag > maxSpeed) {
      entity.vx = (entity.vx / velMag) * maxSpeed;
      entity.vy = (entity.vy / velMag) * maxSpeed;
    }

    entity.vx *= this.config.world.friction;
    entity.vy *= this.config.world.friction;

    if (entity.energy <= 0) this.die(entity);

    if (entity.energy >= settings.reproductionThreshold) {
      entity.energy *= 0.55;
      this.entityPool?.spawn(entity.species, this.config, now, {
        x: entity.x + Math.random() * 12 - 6,
        y: entity.y + Math.random() * 12 - 6,
      });
    }

  }

  private handleFood(dt: number) {
    this.time += dt;
    this.ensureHotspot(this.time);
    if (!this.foodLayer) return;
    this.foodLayer.clear();
    this.foods = this.foods.filter((food) => food.energy > 0);

    const baseTarget = this.getBaseFoodTarget();
    const maxFood = Math.round(baseTarget * 1.25);

    while (this.foods.length < baseTarget && this.foods.length < maxFood) {
      this.foods.push(this.createFood(true));
    }

    for (const food of this.foods) {
      this.foodLayer.circle(food.x, food.y, 3).fill({ color: 0x4ade80, alpha: 0.85 });
      food.energy = Math.max(0, food.energy - dt * 0.4);
    }
  }

  private getBaseFoodTarget() {
    return Math.max(
      12,
      Math.round((this.config.world.width * this.config.world.height * this.config.food.density) / 12000),
    );
  }

  private createFood(biased = false): Food {
    const { x, y } = this.sampleFoodPosition(biased ? 0.75 : 0.35);
    return { x, y, energy: this.config.food.energyPerFood };
  }

  private sampleFoodPosition(biasTowardHotspot: number) {
    const useHotspot = Math.random() < biasTowardHotspot && this.hotspot.expiresAt > 0;
    if (useHotspot) {
      const r = this.hotspot.radius * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const x = clamp(
        this.hotspot.x + Math.cos(theta) * r,
        0,
        this.config.world.width,
      );
      const y = clamp(
        this.hotspot.y + Math.sin(theta) * r,
        0,
        this.config.world.height,
      );
      return { x, y };
    }
    return {
      x: Math.random() * this.config.world.width,
      y: Math.random() * this.config.world.height,
    };
  }

  private ensureHotspot(now: number) {
    if (now < this.hotspot.expiresAt) return;
    this.createHotspot(now);
  }

  private createHotspot(now: number) {
    this.hotspot = {
      x: Math.random() * this.config.world.width,
      y: Math.random() * this.config.world.height,
      radius: 140 + Math.random() * 120,
      expiresAt: now + 5 + Math.random() * 5,
    };

    const burst = 10 + Math.floor(Math.random() * 8);
    const maxFood = Math.round(this.getBaseFoodTarget() * 1.3);
    for (let i = 0; i < burst && this.foods.length < maxFood; i++) {
      this.foods.push(this.createFood(true));
    }
  }

  private seek(
    entity: Entity,
    target: { x: number; y: number },
    settings: SimulationConfig["species"][SpeciesId],
  ) {
    const dx = target.x - entity.x;
    const dy = target.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy) + 1e-6;
    const desire = settings.baseGenome.speed;
    entity.vx += (dx / distance) * desire * 0.3;
    entity.vy += (dy / distance) * desire * 0.3;
  }

  private flee(
    entity: Entity,
    threat: { x: number; y: number },
    settings: SimulationConfig["species"][SpeciesId],
  ) {
    const dx = entity.x - threat.x;
    const dy = entity.y - threat.y;
    const distance = Math.sqrt(dx * dx + dy * dy) + 1e-6;
    const desire = settings.baseGenome.speed;
    entity.vx += (dx / distance) * desire * 0.6;
    entity.vy += (dy / distance) * desire * 0.6;
  }

  private applyMovement(entity: Entity, dt: number) {
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;

    if (this.config.world.wrapAround) {
      if (entity.x < 0) entity.x += this.config.world.width;
      if (entity.x > this.config.world.width) entity.x -= this.config.world.width;
      if (entity.y < 0) entity.y += this.config.world.height;
      if (entity.y > this.config.world.height) entity.y -= this.config.world.height;
    } else {
      if (entity.x < 0 || entity.x > this.config.world.width) entity.vx *= -1;
      if (entity.y < 0 || entity.y > this.config.world.height) entity.vy *= -1;
      entity.x = clamp(entity.x, 0, this.config.world.width);
      entity.y = clamp(entity.y, 0, this.config.world.height);
    }

    entity.view.position.set(entity.x, entity.y);
  }

  private die(entity: Entity) {
    if (entity.state !== "alive") return;
    this.entityPool?.markBiomass(entity);
    this.audio.playDeath();
  }

  private consume(predator: Entity, prey: Entity, now: number) {
    if (prey.state === "biomass") {
      predator.energy += Math.max(
        2,
        this.config.food.energyPerFood * 0.5,
      );
      this.entityPool?.recycle(prey);
      this.audio.playConsume(predator.energy);
      return;
    }

    const predatorSettings = this.config.species[predator.species];
    predator.energy += predatorSettings.energyGain;
    prey.energy = -1;
    prey.state = "alive";
    this.die(prey);
    predator.lastAte = now;
    this.audio.playConsume(predator.energy);
  }

  private findClosestFood(entity: Entity): Food | null {
    let best: Food | null = null;
    let bestDist = Infinity;
    for (const food of this.foods) {
      if (food.energy <= 0) continue;
      const d = distanceSq(entity, food);
      if (d < bestDist) {
        bestDist = d;
        best = food;
      }
    }
    return best;
  }

  private updateVisual(entity: Entity, settings: SimulationConfig["species"][SpeciesId]) {
    const normalizedEnergy = clamp(entity.energy / settings.reproductionThreshold, 0, 1.6);
    const tint = lerpColor(settings.color, settings.highlight, clamp(normalizedEnergy, 0, 1));

    entity.view.tint = entity.state === "biomass" ? 0x7f7f7f : tint;
    entity.view.alpha = entity.state === "alive" ? 0.55 + normalizedEnergy * 0.35 : 0.5;
    entity.view.scale.set(0.8 + normalizedEnergy * 0.25);
  }
}

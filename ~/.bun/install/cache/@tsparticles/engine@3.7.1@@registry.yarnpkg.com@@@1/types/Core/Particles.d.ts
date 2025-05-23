import type { Container } from "./Container.js";
import type { Engine } from "./Engine.js";
import type { ICoordinates } from "./Interfaces/ICoordinates.js";
import type { IDelta } from "./Interfaces/IDelta.js";
import type { IDimension } from "./Interfaces/IDimension.js";
import type { IMouseData } from "./Interfaces/IMouseData.js";
import type { IParticleMover } from "./Interfaces/IParticleMover.js";
import type { IParticleUpdater } from "./Interfaces/IParticleUpdater.js";
import type { IParticlesOptions } from "../Options/Interfaces/Particles/IParticlesOptions.js";
import { Particle } from "./Particle.js";
import { QuadTree } from "./Utils/QuadTree.js";
import type { RecursivePartial } from "../Types/RecursivePartial.js";
export declare class Particles {
    movers: IParticleMover[];
    quadTree: QuadTree;
    updaters: IParticleUpdater[];
    private _array;
    private readonly _container;
    private readonly _engine;
    private readonly _groupLimits;
    private readonly _interactionManager;
    private _lastZIndex;
    private _limit;
    private _needsSort;
    private _nextId;
    private _pluginsInitialized;
    private readonly _pool;
    private _resizeFactor?;
    private _zArray;
    constructor(engine: Engine, container: Container);
    get count(): number;
    addManualParticles(): void;
    addParticle(position?: ICoordinates, overrideOptions?: RecursivePartial<IParticlesOptions>, group?: string, initializer?: (particle: Particle) => boolean): Particle | undefined;
    clear(): void;
    destroy(): void;
    draw(delta: IDelta): void;
    filter(condition: (particle: Particle) => boolean): Particle[];
    find(condition: (particle: Particle) => boolean): Particle | undefined;
    get(index: number): Particle | undefined;
    handleClickMode(mode: string): void;
    init(): Promise<void>;
    initPlugins(): Promise<void>;
    push(nb: number, mouse?: IMouseData, overrideOptions?: RecursivePartial<IParticlesOptions>, group?: string): void;
    redraw(): Promise<void>;
    remove(particle: Particle, group?: string, override?: boolean): void;
    removeAt(index: number, quantity?: number, group?: string, override?: boolean): void;
    removeQuantity(quantity: number, group?: string): void;
    setDensity(): void;
    setLastZIndex(zIndex: number): void;
    setResizeFactor(factor: IDimension): void;
    update(delta: IDelta): void;
    private readonly _addToPool;
    private readonly _applyDensity;
    private readonly _initDensityFactor;
    private readonly _pushParticle;
    private readonly _removeParticle;
}

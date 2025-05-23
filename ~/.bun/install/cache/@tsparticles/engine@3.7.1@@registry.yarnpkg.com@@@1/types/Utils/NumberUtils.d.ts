import type { IPositionFromSizeParams, IRangedPositionFromSizeParams } from "../Core/Interfaces/IPositionFromSizeParams.js";
import { MoveDirection, type MoveDirectionAlt } from "../Enums/Directions/MoveDirection.js";
import type { ICoordinates } from "../Core/Interfaces/ICoordinates.js";
import type { RangeValue } from "../Types/RangeValue.js";
import { Vector } from "../Core/Utils/Vectors.js";
export declare function setRandom(rnd?: () => number): void;
export declare function getRandom(): number;
export declare function setAnimationFunctions(nextFrame: (callback: FrameRequestCallback) => number, cancel: (handle: number) => void): void;
export declare function animate(fn: FrameRequestCallback): number;
export declare function cancelAnimation(handle: number): void;
export declare function clamp(num: number, min: number, max: number): number;
export declare function mix(comp1: number, comp2: number, weight1: number, weight2: number): number;
export declare function randomInRange(r: RangeValue): number;
export declare function getRangeValue(value: RangeValue): number;
export declare function getRangeMin(value: RangeValue): number;
export declare function getRangeMax(value: RangeValue): number;
export declare function setRangeValue(source: RangeValue, value?: number): RangeValue;
export declare function getDistances(pointA: ICoordinates, pointB: ICoordinates): {
    distance: number;
    dx: number;
    dy: number;
};
export declare function getDistance(pointA: ICoordinates, pointB: ICoordinates): number;
export declare function degToRad(degrees: number): number;
export declare function getParticleDirectionAngle(direction: MoveDirection | keyof typeof MoveDirection | MoveDirectionAlt | number, position: ICoordinates, center: ICoordinates): number;
export declare function getParticleBaseVelocity(direction: number): Vector;
export declare function collisionVelocity(v1: Vector, v2: Vector, m1: number, m2: number): Vector;
export declare function calcPositionFromSize(data: IPositionFromSizeParams): ICoordinates | undefined;
export declare function calcPositionOrRandomFromSize(data: IPositionFromSizeParams): ICoordinates;
export declare function calcPositionOrRandomFromSizeRanged(data: IRangedPositionFromSizeParams): ICoordinates;
export declare function calcExactPositionOrRandomFromSize(data: IPositionFromSizeParams): ICoordinates;
export declare function calcExactPositionOrRandomFromSizeRanged(data: IRangedPositionFromSizeParams): ICoordinates;
export declare function parseAlpha(input?: string): number;

import type { ICoordinates, ICoordinates3d } from "../Interfaces/ICoordinates.js";
export declare class Vector3d implements ICoordinates3d {
    x: number;
    y: number;
    z: number;
    protected constructor(xOrCoords: number | ICoordinates3d | ICoordinates, y?: number, z?: number);
    static get origin(): Vector3d;
    get angle(): number;
    set angle(angle: number);
    get length(): number;
    set length(length: number);
    static clone(source: Vector3d): Vector3d;
    static create(x: number | ICoordinates3d, y?: number, z?: number): Vector3d;
    add(v: Vector3d): Vector3d;
    addTo(v: Vector3d): void;
    copy(): Vector3d;
    distanceTo(v: Vector3d): number;
    distanceToSq(v: Vector3d): number;
    div(n: number): Vector3d;
    divTo(n: number): void;
    getLengthSq(): number;
    mult(n: number): Vector3d;
    multTo(n: number): void;
    normalize(): void;
    rotate(angle: number): Vector3d;
    setTo(c: ICoordinates): void;
    sub(v: Vector3d): Vector3d;
    subFrom(v: Vector3d): void;
    private readonly _updateFromAngle;
}
export declare class Vector extends Vector3d {
    protected constructor(xOrCoords: number | ICoordinates, y?: number);
    static get origin(): Vector;
    static clone(source: Vector): Vector;
    static create(x: number | ICoordinates, y?: number): Vector;
}

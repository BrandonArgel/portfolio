import { MoveDirection } from "../../../../Enums/Directions/MoveDirection.js";
import { isNull, isNumber, isObject } from "../../../../Utils/TypeUtils.js";
import { MoveAngle } from "./MoveAngle.js";
import { MoveAttract } from "./MoveAttract.js";
import { MoveCenter } from "./MoveCenter.js";
import { MoveGravity } from "./MoveGravity.js";
import { MovePath } from "./Path/MovePath.js";
import { MoveTrail } from "./MoveTrail.js";
import { OutModes } from "./OutModes.js";
import { Spin } from "./Spin.js";
import { setRangeValue } from "../../../../Utils/NumberUtils.js";
export class Move {
    constructor() {
        this.angle = new MoveAngle();
        this.attract = new MoveAttract();
        this.center = new MoveCenter();
        this.decay = 0;
        this.distance = {};
        this.direction = MoveDirection.none;
        this.drift = 0;
        this.enable = false;
        this.gravity = new MoveGravity();
        this.path = new MovePath();
        this.outModes = new OutModes();
        this.random = false;
        this.size = false;
        this.speed = 2;
        this.spin = new Spin();
        this.straight = false;
        this.trail = new MoveTrail();
        this.vibrate = false;
        this.warp = false;
    }
    load(data) {
        if (isNull(data)) {
            return;
        }
        this.angle.load(isNumber(data.angle) ? { value: data.angle } : data.angle);
        this.attract.load(data.attract);
        this.center.load(data.center);
        if (data.decay !== undefined) {
            this.decay = setRangeValue(data.decay);
        }
        if (data.direction !== undefined) {
            this.direction = data.direction;
        }
        if (data.distance !== undefined) {
            this.distance = isNumber(data.distance)
                ? {
                    horizontal: data.distance,
                    vertical: data.distance,
                }
                : { ...data.distance };
        }
        if (data.drift !== undefined) {
            this.drift = setRangeValue(data.drift);
        }
        if (data.enable !== undefined) {
            this.enable = data.enable;
        }
        this.gravity.load(data.gravity);
        const outModes = data.outModes;
        if (outModes !== undefined) {
            if (isObject(outModes)) {
                this.outModes.load(outModes);
            }
            else {
                this.outModes.load({
                    default: outModes,
                });
            }
        }
        this.path.load(data.path);
        if (data.random !== undefined) {
            this.random = data.random;
        }
        if (data.size !== undefined) {
            this.size = data.size;
        }
        if (data.speed !== undefined) {
            this.speed = setRangeValue(data.speed);
        }
        this.spin.load(data.spin);
        if (data.straight !== undefined) {
            this.straight = data.straight;
        }
        this.trail.load(data.trail);
        if (data.vibrate !== undefined) {
            this.vibrate = data.vibrate;
        }
        if (data.warp !== undefined) {
            this.warp = data.warp;
        }
    }
}

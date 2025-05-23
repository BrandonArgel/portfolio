(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../ValueWithRandom.js", "./SizeAnimation.js", "../../../../Utils/TypeUtils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Size = void 0;
    const ValueWithRandom_js_1 = require("../../ValueWithRandom.js");
    const SizeAnimation_js_1 = require("./SizeAnimation.js");
    const TypeUtils_js_1 = require("../../../../Utils/TypeUtils.js");
    class Size extends ValueWithRandom_js_1.RangedAnimationValueWithRandom {
        constructor() {
            super();
            this.animation = new SizeAnimation_js_1.SizeAnimation();
            this.value = 3;
        }
        load(data) {
            super.load(data);
            if ((0, TypeUtils_js_1.isNull)(data)) {
                return;
            }
            const animation = data.animation;
            if (animation !== undefined) {
                this.animation.load(animation);
            }
        }
    }
    exports.Size = Size;
});

(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.millisecondsToSeconds = exports.halfRandom = exports.percentDenominator = exports.errorPrefix = exports.visibilityChangeEvent = exports.resizeEvent = exports.touchCancelEvent = exports.touchMoveEvent = exports.touchEndEvent = exports.touchStartEvent = exports.mouseMoveEvent = exports.mouseOutEvent = exports.mouseLeaveEvent = exports.mouseUpEvent = exports.mouseDownEvent = exports.generatedAttribute = void 0;
    exports.generatedAttribute = "generated";
    exports.mouseDownEvent = "pointerdown";
    exports.mouseUpEvent = "pointerup";
    exports.mouseLeaveEvent = "pointerleave";
    exports.mouseOutEvent = "pointerout";
    exports.mouseMoveEvent = "pointermove";
    exports.touchStartEvent = "touchstart";
    exports.touchEndEvent = "touchend";
    exports.touchMoveEvent = "touchmove";
    exports.touchCancelEvent = "touchcancel";
    exports.resizeEvent = "resize";
    exports.visibilityChangeEvent = "visibilitychange";
    exports.errorPrefix = "tsParticles - Error";
    exports.percentDenominator = 100;
    exports.halfRandom = 0.5;
    exports.millisecondsToSeconds = 1000;
});

(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../../Utils/TypeUtils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollisionsOverlap = void 0;
    const TypeUtils_js_1 = require("../../../../Utils/TypeUtils.js");
    class CollisionsOverlap {
        constructor() {
            this.enable = true;
            this.retries = 0;
        }
        load(data) {
            if ((0, TypeUtils_js_1.isNull)(data)) {
                return;
            }
            if (data.enable !== undefined) {
                this.enable = data.enable;
            }
            if (data.retries !== undefined) {
                this.retries = data.retries;
            }
        }
    }
    exports.CollisionsOverlap = CollisionsOverlap;
});

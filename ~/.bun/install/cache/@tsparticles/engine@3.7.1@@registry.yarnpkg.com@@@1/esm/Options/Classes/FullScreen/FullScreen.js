import { isNull } from "../../../Utils/TypeUtils.js";
export class FullScreen {
    constructor() {
        this.enable = true;
        this.zIndex = 0;
    }
    load(data) {
        if (isNull(data)) {
            return;
        }
        if (data.enable !== undefined) {
            this.enable = data.enable;
        }
        if (data.zIndex !== undefined) {
            this.zIndex = data.zIndex;
        }
    }
}

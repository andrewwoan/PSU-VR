import { EventEmitter } from "events";

export default class Sizes extends EventEmitter {
    constructor() {
        super();
        this.handleSizes();
        window.addEventListener("resize", () => {
            this.handleSizes();
            this.emit("resize");
        });
    }

    handleSizes() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    }
}

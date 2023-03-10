import * as THREE from "three";
import Experience from "./Experience.js";

export default class Preloader {
    constructor() {
        this.experience = new Experience();
        this.resources = this.experience.resources;

        this.loaded = 0;
        this.queue = 0;

        this.setPreloader();

        this.resources.on("loading", (loaded, queue) => {
            this.updateProgress(loaded, queue);
        });
    }

    setPreloader() {}

    updateProgress(loaded, queue) {
        console.log(loaded, queue);
    }
}

import * as THREE from "three";
import Experience from "./Experience.js";

import lerp from "./Utils/functions/lerp.js";
import elements from "./Utils/functions/elements.js";

import gsap from "gsap";

export default class Preloader {
    constructor() {
        this.experience = new Experience();
        this.resources = this.experience.resources;

        this.loaded = 0;
        this.queue = 0;

        this.counter = 0;
        this.amountDone = 0;

        this.domElements = elements({
            preloader: ".preloader",
            text1: ".preloader-percentage1",
            text2: ".preloader-percentage2",
            progressBar: ".progress-bar",
        });

        // **** This is for updating a percentage ****
        this.resources.on("loading", (loaded, queue) => {
            this.updateProgress(loaded, queue);
        });

        this.resources.on("ready", () => {
            this.playIntro();
        });
    }

    updateProgress(loaded, queue) {
        this.amountDone = Math.round((loaded / queue) * 100);
    }

    async playIntro() {
        return new Promise((resolve) => {
            this.timeline = new gsap.timeline();
            this.timeline.to(".preloader", {
                // opacity: 0.2,
                duration: 1.5,
                delay: 2.2,
                top: "-100%",
                ease: "power4.out",
                onComplete: () => {
                    this.domElements.preloader.classList.add("hidden");
                },
            });
        });
    }

    update() {
        if (this.counter < this.amountDone) {
            this.counter++;
            this.domElements.text1.innerText = Math.round(this.counter / 10);
            this.domElements.text2.innerText = Math.round(this.counter % 10);
            this.domElements.progressBar.style.width =
                Math.round(this.counter) + "%";
        }
    }
}

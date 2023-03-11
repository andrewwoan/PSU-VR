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

        this.previousProgress = 0;

        this.elements = elements({ loadingText: ".loading-text" });

        // **** This is for updating a percentage ****
        // this.resources.on("loading", (loaded, queue) => {
        //     this.updateProgress(loaded, queue);
        // });

        this.resources.on("ready", () => {
            this.playIntro();
        });
    }

    // setPreloader() {}
    // updateProgress(loaded, queue) {
    //     const percent = loaded / queue;
    //     this.elements.loadingText.innerText = `${Math.round(percent * 100)}%`;
    // }

    async playIntro() {
        return new Promise((resolve) => {
            this.timeline = new gsap.timeline();
            this.timeline.to(".preloader", {
                // opacity: 0.2,
                top: "-100%",
                delay: 1,
                ease: "power4.out",
                onComplete: () => {
                    document
                        .querySelector(".preloader")
                        .classList.add("hidden");
                },
            });
        });
    }
}

import * as THREE from "three";

import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Resources from "./Utils/Resources.js";
import assets from "./Utils/assets.js";

import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import Preloader from "./Preloader.js";

import World from "./World/World.js";

export default class Experience {
    static instance;

    constructor(canvas, socket) {
        if (Experience.instance) {
            return Experience.instance;
        }

        Experience.instance = this;

        this.canvas = canvas;
        this.socket = socket;
        this.sizes = new Sizes();
        this.time = new Time();

        this.setScene();
        this.setCamera();
        this.setRenderer();
        this.setResources();
        this.setPreloader();
        this.setWorld();

        this.sizes.on("resize", () => {
            this.onResize();
        });

        this.update();
    }

    setScene() {
        this.scene = new THREE.Scene();
    }

    setCamera() {
        this.camera = new Camera();
    }

    setRenderer() {
        this.renderer = new Renderer();
    }

    setResources() {
        this.resources = new Resources(assets);
    }

    setPreloader() {
        this.preloader = new Preloader();
    }

    setWorld() {
        this.world = new World();
    }

    onResize() {
        this.camera.onResize();
        this.renderer.onResize();
    }

    update() {
        if (this.preloader) this.preloader.update();
        if (this.camera) this.camera.update();
        if (this.renderer) this.renderer.update();
        if (this.world) this.world.update();
        if (this.time) this.time.update();

        window.requestAnimationFrame(() => {
            this.update();
        });
    }
}

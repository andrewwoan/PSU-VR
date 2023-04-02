import * as THREE from "three";
import Experience from "../../Experience.js";

export default class Nametag {
    constructor() {
        this.experience = new Experience();
        this.resources = this.experience.resources;
        this.scene = this.experience.scene;
        this.nametag = "";

        this.createNametag();
    }

    createNametag(text) {
        text = "Hello World Test";
        this.canvas = document.createElement("canvas");
        this.context = canvas.getContext("2d");

        this.context.font = "bold 12px Arial";
        const width = this.context.measureText(text).width + 10;
        canvas.width = width;
        canvas.height = 20;
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, width, 20);
        this.context.fillStyle = "black";
        this.context.fillText(text, 5, 15);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const geometry = new THREE.PlaneGeometry(width / 20, 1);

        this.nametag = new THREE.Mesh(geometry, material);

        this.scene.add(this.nametag);

        return this.nametag;
    }

    update() {}
}

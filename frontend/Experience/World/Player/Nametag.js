import * as THREE from "three";
import Experience from "../../Experience.js";

export default class Nametag {
    constructor() {
        super();
        this.experience = new Experience();
        this.resources = this.experience.resources;
        this.scene = this.experience.scene;

        this.createNametag();
    }

    createNametag() {
        this.canvas = document.createElement("canvas");
        this.context = canvas.getContext("2d");

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
        });
        this.avatar = new THREE.Mesh(geometry, material);
        // this.scene.add(this.avatar);
    }

    update() {}
}

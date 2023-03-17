import * as THREE from "three";
import { EventEmitter } from "events";
import Experience from "../../Experience.js";

export default class Avatar extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.resources = this.experience.resources;
        this.scene = this.experience.scene;

        this.createAvatar();
    }

    createAvatar() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
        });
        this.avatar = new THREE.Mesh(geometry, material);
        this.scene.add(this.avatar);
    }

    update() {}
}

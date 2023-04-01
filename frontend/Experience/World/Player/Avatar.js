import * as THREE from "three";
import Experience from "../../Experience.js";

export default class Avatar {
    constructor() {
        this.experience = new Experience();
        this.resources = this.experience.resources;
        this.scene = this.experience.scene;

        this.createAvatar();
    }

    createAvatar() {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
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

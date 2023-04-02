import * as THREE from "three";
import Experience from "../../Experience.js";
import Nametag from "./Nametag.js";

export default class Avatar {
    constructor() {
        this.experience = new Experience();
        this.nametag = new Nametag();
        this.resources = this.experience.resources;
        this.scene = this.experience.scene;
    }

    createAvatar(id, name = "anonymous") {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
        });
        const head = new THREE.Mesh(geometry, material);
        head.rotation.order = "YXZ";
        head.userData = id;

        const nametag = this.nametag.createNametag(32, 150, name);

        // return this.head;
        head.position.y = 1.2;
        nametag.position.y = 1.2 + 0.5;

        return { head, nametag };
    }

    update() {}
}

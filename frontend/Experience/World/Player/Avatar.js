import * as THREE from "three";
import Experience from "../../Experience.js";
import Nametag from "./Nametag.js";

export default class Avatar {
    constructor() {
        this.experience = new Experience();
        this.nametag = new Nametag();
        this.resources = this.experience.resources;
        this.scene = this.experience.scene;

        this.avatar = new THREE.Object3D();
    }

    createAvatar(name = "anonymous") {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
        });
        const head = new THREE.Mesh(geometry, material);

        const nametag = this.nametag.createNametag(32, 150, name);

        // return this.head;
        head.position.y = 1.2;
        nametag.position.y = 1.2 + 0.5;

        this.avatar.add(nametag);
        this.avatar.add(head);

        this.scene.add(this.avatar);
    }

    update() {}
}

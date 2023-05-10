import * as THREE from "three";
import Experience from "../../Experience.js";
import Nametag from "./Nametag.js";

export default class Avatar {
    constructor() {
        this.experience = new Experience();
        this.nametag = new Nametag();
        this.time = this.experience.time;
        this.resources = this.experience.resources;
        this.scene = this.experience.scene;

        this.resource = this.resources.items.asian_male;
        this.avatar = this.resource.scene;
        this.avatar.scale.set(1.1, 1.1, 1.1);
        this.scene.add(this.avatar);

        this.setAnimation();
    }

    createAvatar(id = "self", name = "Anonymous") {
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMaterial = new THREE.MeshBasicMaterial({
            color: 0x002a83,
            transparent: true,
            // opacity: 0.5,
        });
        const faceMaterial = new THREE.MeshBasicMaterial({
            color: 0x0e56ee,
            transparent: true,
        });

        const materials = [
            headMaterial,
            headMaterial,
            headMaterial,
            headMaterial,
            headMaterial,
            faceMaterial,
        ];

        headGeometry.groups.forEach((face, i) => {
            face.materialIndex = i;
        });

        const head = new THREE.Mesh(headGeometry, materials);
        head.rotation.order = "YXZ";
        head.userData = id;

        const nametag = this.nametag.createNametag(24, 165, name);

        const bodyGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        const bodyMaterial = new THREE.MeshBasicMaterial({
            color: 0x002a83,
            transparent: true,
            // opacity: 0.5,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

        return { head, nametag, body };
    }

    setAnimation() {
        this.animation = {};

        this.animation.mixer = new THREE.AnimationMixer(this.avatar);

        this.animation.actions = {};

        this.animation.actions.dancing = this.animation.mixer.clipAction(
            this.resource.animations[0]
        );
        this.animation.actions.idle = this.animation.mixer.clipAction(
            this.resource.animations[1]
        );
        this.animation.actions.running = this.animation.mixer.clipAction(
            this.resource.animations[2]
        );
        this.animation.actions.walking = this.animation.mixer.clipAction(
            this.resource.animations[3]
        );
        this.animation.actions.waving = this.animation.mixer.clipAction(
            this.resource.animations[4]
        );

        this.animation.actions.current = this.animation.actions.idle;
        this.animation.actions.current.play();

        this.animation.play = (name) => {
            const newAction = this.animation.actions[name];
            const oldAction = this.animation.actions.current;

            if (oldAction === newAction) {
                return;
            }

            newAction.reset();
            newAction.play();
            newAction.crossFadeFrom(oldAction, 0.2);

            this.animation.actions.current = newAction;
        };
    }

    update() {
        this.animation.mixer.update(this.time.delta * 1.05);
    }
}

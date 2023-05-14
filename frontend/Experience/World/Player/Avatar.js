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
        this.avatar.scale.set(0.99, 0.99, 0.99);
        this.scene.add(this.avatar);

        this.setAnimation();
    }

    createAvatar(id = "self", name = "Anonymous") {}

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
        this.animation.actions.jumping = this.animation.mixer.clipAction(
            this.resource.animations[2]
        );

        this.animation.actions.running = this.animation.mixer.clipAction(
            this.resource.animations[3]
        );
        this.animation.actions.walking = this.animation.mixer.clipAction(
            this.resource.animations[4]
        );
        this.animation.actions.waving = this.animation.mixer.clipAction(
            this.resource.animations[5]
        );

        this.animation.actions.current = this.animation.actions.idle;
        this.animation.actions.current.play();

        this.animation.play = (name) => {
            const newAction = this.animation.actions[name];
            const oldAction = this.animation.actions.current;

            if (oldAction === newAction) {
                return;
            }

            if (name === "jumping") {
                this.speedAdjustment = 1.5;
            } else {
                this.speedAdjustment = 1.05;
            }

            newAction.reset();
            newAction.play();
            newAction.crossFadeFrom(oldAction, 0.2);

            this.animation.actions.current = newAction;
        };
    }

    update() {
        this.animation.mixer.update(this.time.delta * this.speedAdjustment);
    }
}

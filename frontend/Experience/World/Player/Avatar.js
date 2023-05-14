import * as THREE from "three";
import Nametag from "./Nametag.js";

export default class Avatar {
    constructor(experience, scene) {
        this.experience = experience;
        this.scene = scene;
        this.nametag = new Nametag();
        this.resources = this.experience.resources;

        this.setAvatar();
        this.setAnimation();
    }

    setAvatar() {
        this.resource = this.resources.items.asian_male;
        this.avatar = this.resource.scene;
        this.speedAdjustment = 1.05;
        this.avatar.scale.set(0.99, 0.99, 0.99);
        this.scene.add(this.avatar);
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

            newAction.reset();
            newAction.play();
            newAction.crossFadeFrom(oldAction, 0.2);

            this.animation.actions.current = newAction;
        };

        this.animation.update = (time, speed) => {
            this.animation.mixer.update(time * speed);
        };
    }
}

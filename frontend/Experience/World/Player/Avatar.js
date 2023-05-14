import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import Nametag from "./Nametag.js";

export default class Avatar {
    constructor(avatar, scene) {
        this.avatar = SkeletonUtils.clone(avatar.scene);

        this.animationData = avatar.animations.map((clip) => {
            return clip.clone();
        });

        this.scene = scene;
        this.nametag = new Nametag();

        this.setAvatar();
    }

    setAvatar() {
        this.speedAdjustment = 1.05;
        this.avatar.scale.set(0.99, 0.99, 0.99);
        this.setAnimation();
        this.scene.add(this.avatar);
    }

    setAnimation() {
        this.animation = {};

        this.animation.mixer = new THREE.AnimationMixer(this.avatar);

        this.animation.actions = {};

        this.animation.actions.dancing = this.animation.mixer.clipAction(
            this.animationData[0]
        );
        this.animation.actions.idle = this.animation.mixer.clipAction(
            this.animationData[1]
        );
        this.animation.actions.jumping = this.animation.mixer.clipAction(
            this.animationData[2]
        );

        this.animation.actions.running = this.animation.mixer.clipAction(
            this.animationData[3]
        );
        this.animation.actions.walking = this.animation.mixer.clipAction(
            this.animationData[4]
        );
        this.animation.actions.waving = this.animation.mixer.clipAction(
            this.animationData[5]
        );

        this.animation.actions.current = this.animation.actions.idle;
        this.animation.actions.current.play();

        this.animation.play = (name) => {
            const newAction = this.animation.actions[name];
            const oldAction = this.animation.actions.current;

            if (oldAction === newAction) {
                return;
            }

            if (this.animation.actions.current === "jumping") {
                this.speedAdjustment = 1.5;
            } else {
                this.speedAdjustment = 1.05;
            }

            newAction.reset();
            newAction.play();
            newAction.crossFadeFrom(oldAction, 0.2);

            this.animation.actions.current = newAction;
        };

        this.animation.update = (time) => {
            this.animation.mixer.update(time * this.speedAdjustment);
        };
    }
}

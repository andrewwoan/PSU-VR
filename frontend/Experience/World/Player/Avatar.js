import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import Nametag from "./Nametag.js";

export default class Avatar {
    constructor(avatar, scene, name = "Anonymous", id) {
        this.scene = scene;
        this.name = new Nametag();
        this.nametag = this.name.createNametag(16, 150, name);
        this.avatar = SkeletonUtils.clone(avatar.scene);
        this.avatar.userData.id = id;

        this.avatar.animations = avatar.animations.map((clip) => {
            return clip.clone();
        });

        this.setAvatar();
    }

    setAvatar() {
        this.speedAdjustment = 1;
        this.avatar.scale.set(0.99, 0.99, 0.99);
        this.setAnimation();
        this.scene.add(this.avatar);

        if (this.avatar.userData.id) {
            this.scene.add(this.nametag);
        }
    }

    setAnimation() {
        this.animation = {};

        this.animation.mixer = new THREE.AnimationMixer(this.avatar);

        this.animation.actions = {};

        this.animation.actions.dancing = this.animation.mixer.clipAction(
            this.avatar.animations[0]
        );

        this.animation.actions.idle = this.animation.mixer.clipAction(
            this.avatar.animations[1]
        );
        this.animation.actions.jumping = this.animation.mixer.clipAction(
            this.avatar.animations[2]
        );

        this.animation.actions.running = this.animation.mixer.clipAction(
            this.avatar.animations[3]
        );
        this.animation.actions.walking = this.animation.mixer.clipAction(
            this.avatar.animations[4]
        );
        this.animation.actions.waving = this.animation.mixer.clipAction(
            this.avatar.animations[5]
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
                this.speedAdjustment = 1.0;
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

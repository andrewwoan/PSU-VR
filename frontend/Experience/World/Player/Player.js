import * as THREE from "three";
import Experience from "../../Experience.js";
import { Capsule } from "three/examples/jsm/math/Capsule";

import nipplejs from "nipplejs";
import elements from "../../Utils/functions/elements.js";

import Avatar from "./Avatar.js";

export default class Player {
    constructor() {
        this.experience = new Experience();
        this.time = this.experience.time;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;
        this.octree = this.experience.world.octree;
        this.resources = this.experience.resources;
        this.socket = this.experience.socket;

        this.domElements = elements({
            joystickArea: ".joystick-area",
            controlOverlay: ".control-overlay",
            messageInput: "#chat-message-input",
            switchViewButton: ".switch-camera-view",
        });

        this.initPlayer();
        this.initControls();
        this.setPlayerSocket();
        this.setJoyStick();
        this.addEventListeners();
    }

    initPlayer() {
        this.player = {};

        this.player.body = this.camera.perspectiveCamera;
        this.player.animation = "idle";

        this.jumpOnce = false;
        this.player.onFloor = false;
        this.player.gravity = 60;

        this.player.spawn = {
            position: new THREE.Vector3(),
            rotation: new THREE.Euler(),
            velocity: new THREE.Vector3(),
        };

        this.player.raycaster = new THREE.Raycaster();
        this.player.raycaster.far = 5;

        this.player.height = 1.2;
        this.player.speedMultiplier = 0.35;
        this.player.position = new THREE.Vector3();
        this.player.quaternion = new THREE.Euler();
        this.player.directionOffset = 0;
        this.targetRotation = new THREE.Quaternion();

        this.upVector = new THREE.Vector3(0, 1, 0);
        this.player.velocity = new THREE.Vector3();
        this.player.direction = new THREE.Vector3();

        this.player.collider = new Capsule(
            new THREE.Vector3(),
            new THREE.Vector3(),
            0.35
        );

        this.otherPlayers = {};

        this.socket.emit("setID");
        this.socket.emit("initPlayer", this.player);
    }

    initControls() {
        this.actions = {};

        this.coords = {
            previousX: 0,
            previousY: 0,
            currentX: 0,
            currentY: 0,
        };

        this.joystickVector = new THREE.Vector3();
    }

    setJoyStick() {
        this.options = {
            zone: this.domElements.joystickArea,
            mode: "dynamic",
        };
        this.joystick = nipplejs.create(this.options);

        this.joystick.on("move", (e, data) => {
            this.actions.movingJoyStick = true;
            this.joystickVector.z = -data.vector.y;
            this.joystickVector.x = data.vector.x;
        });

        this.joystick.on("end", () => {
            this.actions.movingJoyStick = false;
        });
    }

    setPlayerSocket() {
        this.socket.on("setID", (setID, name) => {});

        this.socket.on("setAvatarSkin", (avatarSkin, id) => {
            if (!this.avatar && id === this.socket.id) {
                this.player.avatarSkin = avatarSkin;
                this.avatar = new Avatar(
                    this.resources.items[avatarSkin],
                    this.scene
                );
                this.updatePlayerSocket();
            }
        });

        this.socket.on("playerData", (playerData) => {
            for (let player of playerData) {
                if (player.id !== this.socket.id) {
                    this.scene.traverse((child) => {
                        if (child.userData.id === player.id) {
                            return;
                        } else {
                            if (!this.otherPlayers.hasOwnProperty(player.id)) {
                                if (
                                    player.name === "" ||
                                    player.avatarSkin === ""
                                ) {
                                    return;
                                }

                                const name = player.name.substring(0, 25);

                                const newAvatar = new Avatar(
                                    this.resources.items[player.avatarSkin],
                                    this.scene,
                                    name,
                                    player.id
                                );

                                player.model = newAvatar;
                                this.otherPlayers[player.id] = player;
                            }
                        }
                    });
                    if (this.otherPlayers[player.id]) {
                        this.otherPlayers[player.id].position = {
                            position_x: player.position_x,
                            position_y: player.position_y,
                            position_z: player.position_z,
                        };
                        this.otherPlayers[player.id].quaternion = {
                            quaternion_x: player.quaternion_x,
                            quaternion_y: player.quaternion_y,
                            quaternion_z: player.quaternion_z,
                            quaternion_w: player.quaternion_w,
                        };
                        this.otherPlayers[player.id].animation = {
                            animation: player.animation,
                        };
                    }
                }
            }
        });

        this.socket.on("removePlayer", (id) => {
            this.disconnectedPlayerId = id;

            this.otherPlayers[id].model.nametag.material.dispose();
            this.otherPlayers[id].model.nametag.geometry.dispose();
            this.scene.remove(this.otherPlayers[id].model.nametag);

            this.otherPlayers[id].model.avatar.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.dispose();
                    child.geometry.dispose();
                }

                if (child.material) {
                    child.material.dispose();
                }

                if (child.geometry) {
                    child.geometry.dispose();
                }
            });

            this.scene.remove(this.otherPlayers[id].model.avatar);

            delete this.otherPlayers[id].nametag;
            delete this.otherPlayers[id].model;
            delete this.otherPlayers[id];
        });
    }

    updatePlayerSocket() {
        setInterval(() => {
            if (this.avatar) {
                this.socket.emit("updatePlayer", {
                    position: this.avatar.avatar.position,
                    quaternion: this.avatar.avatar.quaternion,
                    animation: this.player.animation,
                    avatarSkin: this.player.avatarSkin,
                });
            }
        }, 20);
    }

    onKeyDown = (e) => {
        if (document.activeElement === this.domElements.messageInput) return;

        if (e.code === "KeyW" || e.code === "ArrowUp") {
            this.actions.forward = true;
        }
        if (e.code === "KeyS" || e.code === "ArrowDown") {
            this.actions.backward = true;
        }
        if (e.code === "KeyA" || e.code === "ArrowLeft") {
            this.actions.left = true;
        }
        if (e.code === "KeyD" || e.code === "ArrowRight") {
            this.actions.right = true;
        }
        if (!this.actions.run && !this.actions.jump) {
            this.player.animation = "walking";
        }

        if (e.code === "KeyO") {
            this.player.animation = "dancing";
        }

        if (e.code === "ShiftLeft") {
            this.actions.run = true;
            this.player.animation = "running";
        }

        if (e.code === "Space" && !this.actions.jump && this.player.onFloor) {
            this.actions.jump = true;
            this.player.animation = "jumping";
            this.jumpOnce = true;
        }
    };

    onKeyUp = (e) => {
        if (e.code === "KeyW" || e.code === "ArrowUp") {
            this.actions.forward = false;
        }
        if (e.code === "KeyS" || e.code === "ArrowDown") {
            this.actions.backward = false;
        }
        if (e.code === "KeyA" || e.code === "ArrowLeft") {
            this.actions.left = false;
        }
        if (e.code === "KeyD" || e.code === "ArrowRight") {
            this.actions.right = false;
        }

        if (e.code === "ShiftLeft") {
            this.actions.run = false;
        }

        if (this.player.onFloor) {
            if (this.actions.run) {
                this.player.animation = "running";
            } else if (
                this.actions.forward ||
                this.actions.backward ||
                this.actions.left ||
                this.actions.right
            ) {
                this.player.animation = "walking";
            } else {
                this.player.animation = "idle";
            }
        }

        if (e.code === "Space") {
            this.actions.jump = false;
        }
    };

    playerCollisions() {
        const result = this.octree.capsuleIntersect(this.player.collider);
        this.player.onFloor = false;

        if (result) {
            this.player.onFloor = result.normal.y > 0;

            this.player.collider.translate(
                result.normal.multiplyScalar(result.depth)
            );
        }
    }

    getForwardVector() {
        this.camera.perspectiveCamera.getWorldDirection(this.player.direction);
        this.player.direction.y = 0;
        this.player.direction.normalize();

        return this.player.direction;
    }

    getSideVector() {
        this.camera.perspectiveCamera.getWorldDirection(this.player.direction);
        this.player.direction.y = 0;
        this.player.direction.normalize();
        this.player.direction.cross(this.camera.perspectiveCamera.up);

        return this.player.direction;
    }

    getJoyStickDirectionalVector() {
        let returnVector = new THREE.Vector3();
        returnVector.copy(this.joystickVector);

        returnVector.applyQuaternion(this.camera.perspectiveCamera.quaternion);
        returnVector.y = 0;
        returnVector.multiplyScalar(1.5);

        return returnVector;
    }

    addEventListeners() {
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
    }

    resize() {}

    spawnPlayerOutOfBounds() {
        const spawnPos = new THREE.Vector3(-22.4437, 8 + 5, -15.0529);
        this.player.velocity = this.player.spawn.velocity;

        this.player.collider.start.copy(spawnPos);
        this.player.collider.end.copy(spawnPos);

        this.player.collider.end.y += this.player.height;
    }

    updateColliderMovement() {
        const speed =
            (this.player.onFloor ? 1.75 : 0.1) *
            this.player.gravity *
            this.player.speedMultiplier;

        let speedDelta = this.time.delta * speed;

        if (this.actions.movingJoyStick) {
            this.player.velocity.add(this.getJoyStickDirectionalVector());
        }

        if (this.actions.run) {
            speedDelta *= 2.5;
        }

        if (this.actions.forward) {
            this.player.velocity.add(
                this.getForwardVector().multiplyScalar(speedDelta)
            );
        }
        if (this.actions.backward) {
            this.player.velocity.add(
                this.getForwardVector().multiplyScalar(-speedDelta)
            );
        }
        if (this.actions.left) {
            this.player.velocity.add(
                this.getSideVector().multiplyScalar(-speedDelta)
            );
        }
        if (this.actions.right) {
            this.player.velocity.add(
                this.getSideVector().multiplyScalar(speedDelta)
            );
        }

        if (this.player.onFloor) {
            if (this.actions.jump && this.jumpOnce) {
                this.player.velocity.y = 12;
            }
            this.jumpOnce = false;
        }

        let damping = Math.exp(-15 * this.time.delta) - 1;

        if (!this.player.onFloor) {
            if (this.player.animation === "jumping") {
                this.player.velocity.y -=
                    this.player.gravity * 0.7 * this.time.delta;
            } else {
                this.player.velocity.y -= this.player.gravity * this.time.delta;
            }
            damping *= 0.1;
        }

        this.player.velocity.addScaledVector(this.player.velocity, damping);

        const deltaPosition = this.player.velocity
            .clone()
            .multiplyScalar(this.time.delta);

        this.player.collider.translate(deltaPosition);
        this.playerCollisions();

        this.player.body.position.sub(this.camera.controls.target);
        this.camera.controls.target.copy(this.player.collider.end);
        this.player.body.position.add(this.player.collider.end);

        this.player.body.updateMatrixWorld();

        if (this.player.body.position.y < -20) {
            this.spawnPlayerOutOfBounds();
        }
    }

    setInteractionObjects(interactionObjects) {
        this.player.interactionObjects = interactionObjects;
    }

    getgetCameraLookAtDirectionalVector() {
        const direction = new THREE.Vector3(0, 0, -1);
        return direction.applyQuaternion(
            this.camera.perspectiveCamera.quaternion
        );
    }

    updateRaycaster() {
        this.player.raycaster.ray.origin.copy(
            this.camera.perspectiveCamera.position
        );

        this.player.raycaster.ray.direction.copy(
            this.getgetCameraLookAtDirectionalVector()
        );

        const intersects = this.player.raycaster.intersectObjects(
            this.player.interactionObjects.children
        );

        if (intersects.length === 0) {
            this.currentIntersectObject = "";
        } else {
            this.currentIntersectObject = intersects[0].object.name;
        }

        if (this.currentIntersectObject !== this.previousIntersectObject) {
            this.previousIntersectObject = this.currentIntersectObject;
        }
    }

    updateAvatarPosition() {
        this.avatar.avatar.position.copy(this.player.collider.end);
        this.avatar.avatar.position.y -= 1.56;

        this.avatar.animation.update(this.time.delta);
    }

    updateOtherPlayers() {
        for (let player in this.otherPlayers) {
            this.otherPlayers[player].model.avatar.position.set(
                this.otherPlayers[player].position.position_x,
                this.otherPlayers[player].position.position_y,
                this.otherPlayers[player].position.position_z
            );

            this.otherPlayers[player].model.animation.play(
                this.otherPlayers[player].animation.animation
            );

            this.otherPlayers[player].model.animation.update(this.time.delta);

            this.otherPlayers[player].model.avatar.quaternion.set(
                this.otherPlayers[player].quaternion.quaternion_x,
                this.otherPlayers[player].quaternion.quaternion_y,
                this.otherPlayers[player].quaternion.quaternion_z,
                this.otherPlayers[player].quaternion.quaternion_w
            );

            this.otherPlayers[player].model.nametag.position.set(
                this.otherPlayers[player].position.position_x,
                this.otherPlayers[player].position.position_y + 2.1,
                this.otherPlayers[player].position.position_z
            );
        }
    }

    updateAvatarRotation() {
        if (this.actions.forward) {
            this.player.directionOffset = Math.PI;
        }
        if (this.actions.backward) {
            this.player.directionOffset = 0;
        }

        if (this.actions.left) {
            this.player.directionOffset = -Math.PI / 2;
        }

        if (this.actions.forward && this.actions.left) {
            this.player.directionOffset = Math.PI + Math.PI / 4;
        }
        if (this.actions.backward && this.actions.left) {
            this.player.directionOffset = -Math.PI / 4;
        }

        if (this.actions.right) {
            this.player.directionOffset = Math.PI / 2;
        }

        if (this.actions.forward && this.actions.right) {
            this.player.directionOffset = Math.PI - Math.PI / 4;
        }
        if (this.actions.backward && this.actions.right) {
            this.player.directionOffset = Math.PI / 4;
        }

        if (this.actions.forward && this.actions.left && this.actions.right) {
            this.player.directionOffset = Math.PI;
        }
        if (this.actions.backward && this.actions.left && this.actions.right) {
            this.player.directionOffset = 0;
        }

        if (
            this.actions.right &&
            this.actions.backward &&
            this.actions.forward
        ) {
            this.player.directionOffset = Math.PI / 2;
        }

        if (
            this.actions.left &&
            this.actions.backward &&
            this.actions.forward
        ) {
            this.player.directionOffset = -Math.PI / 2;
        }
    }

    updateAvatarAnimation() {
        if (this.player.animation !== this.avatar.animation) {
            if (
                this.actions.left &&
                this.actions.right &&
                !this.actions.forward &&
                !this.actions.backward
            ) {
                this.player.animation = "idle";
            }

            if (
                !this.actions.left &&
                !this.actions.right &&
                this.actions.forward &&
                this.actions.backward
            ) {
                this.player.animation = "idle";
            }

            if (
                this.actions.left &&
                this.actions.right &&
                this.actions.forward &&
                this.actions.backward
            ) {
                this.player.animation = "idle";
            }

            if (
                !this.actions.left &&
                !this.actions.right &&
                !this.actions.forward &&
                !this.actions.backward &&
                this.actions.run
            ) {
                this.player.animation = "idle";
            }

            if (
                this.actions.run &&
                this.actions.left &&
                this.actions.right &&
                this.actions.forward &&
                !this.actions.backward
            ) {
                this.player.animation = "running";
            }

            if (
                this.actions.run &&
                this.actions.left &&
                this.actions.right &&
                this.actions.backward &&
                !this.actions.forward
            ) {
                this.player.animation = "running";
            }

            if (
                this.actions.run &&
                !this.actions.left &&
                !this.actions.right &&
                this.actions.forward &&
                !this.actions.backward &&
                this.player.animation !== "jumping"
            ) {
                this.player.animation = "running";
            }

            if (
                this.actions.run &&
                !this.actions.left &&
                !this.actions.right &&
                this.actions.backward &&
                !this.actions.forward &&
                this.player.animation !== "jumping"
            ) {
                this.player.animation = "running";
            }

            if (
                this.actions.run &&
                !this.actions.left &&
                !this.actions.right &&
                this.actions.backward &&
                this.actions.forward &&
                this.player.animation !== "jumping"
            ) {
                this.player.animation = "idle";
            }

            if (
                this.actions.run &&
                this.actions.left &&
                this.actions.right &&
                !this.actions.backward &&
                !this.actions.forward &&
                this.player.animation !== "jumping"
            ) {
                this.player.animation = "idle";
            }

            if (
                this.actions.run &&
                !this.actions.left &&
                this.actions.right &&
                !this.actions.backward &&
                this.actions.forward &&
                this.player.animation !== "jumping"
            ) {
                this.player.animation = "running";
            }

            if (
                this.actions.run &&
                this.actions.left &&
                !this.actions.right &&
                this.actions.backward &&
                !this.actions.forward &&
                this.player.animation !== "jumping"
            ) {
                this.player.animation = "running";
            }
            if (
                this.actions.run &&
                this.actions.left &&
                !this.actions.right &&
                !this.actions.backward &&
                !this.actions.forward &&
                this.player.animation !== "jumping"
            ) {
                this.player.animation = "running";
            }
            if (
                this.actions.run &&
                !this.actions.left &&
                this.actions.right &&
                !this.actions.backward &&
                !this.actions.forward &&
                this.player.animation !== "jumping"
            ) {
                this.player.animation = "running";
            }

            if (
                this.actions.run &&
                !this.actions.left &&
                !this.actions.right &&
                !this.actions.backward &&
                !this.actions.forward &&
                this.actions.jump
            ) {
                this.player.animation = "jumping";
            }

            if (this.player.animation === "jumping" && !this.jumpOnce) {
                if (this.player.onFloor) {
                    if (this.actions.run) {
                        this.player.animation = "running";
                    } else if (
                        this.actions.forward ||
                        this.actions.backward ||
                        this.actions.left ||
                        this.actions.right
                    ) {
                        this.player.animation = "walking";
                    } else {
                        this.player.animation = "idle";
                    }
                }
            }

            this.avatar.animation.play(this.player.animation);
        } else {
            this.avatar.animation.play("idle");
        }
    }

    updateCameraPosition() {
        if (
            this.player.animation !== "idle" &&
            this.player.animation !== "dancing"
        ) {
            const cameraAngleFromPlayer = Math.atan2(
                this.player.body.position.x - this.avatar.avatar.position.x,
                this.player.body.position.z - this.avatar.avatar.position.z
            );

            this.targetRotation.setFromAxisAngle(
                this.upVector,
                cameraAngleFromPlayer + this.player.directionOffset
            );
            this.avatar.avatar.quaternion.rotateTowards(
                this.targetRotation,
                0.15
            );
        }
    }

    update() {
        if (this.avatar) {
            this.updateColliderMovement();
            this.updateAvatarPosition();
            this.updateAvatarRotation();
            this.updateAvatarAnimation();
            this.updateCameraPosition();
            this.updateOtherPlayers();
        }
    }
}

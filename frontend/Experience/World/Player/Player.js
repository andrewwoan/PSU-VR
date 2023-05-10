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
        this.avatar = new Avatar();
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

        this.player.avatar = this.avatar.createAvatar();
        this.player.animation = "idle";
        // this.player.avatar.children[0].material.opacity = 0;

        // this.camera.controls.maxPolarAngle = Math.PI;
        // this.camera.controls.minDistance = 1e-4;
        // this.camera.controls.maxDistance = 1e-4;

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
        this.player.position = new THREE.Vector3();
        this.player.quaternion = new THREE.Euler();
        this.player.directionOffset = 0;
        this.targetRotation = new THREE.Quaternion();

        this.upVector = new THREE.Vector3(0, 1, 0);

        // this.player.quaternion.order = "YXZ";

        this.player.velocity = new THREE.Vector3();
        this.player.direction = new THREE.Vector3();

        this.player.speedMultiplier = 0.35;

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
        this.socket.on("setID", (setID) => {});

        this.socket.on("playerData", (playerData) => {
            // console.log(playerData);
            for (let player of playerData) {
                if (player.id !== this.socket.id) {
                    this.scene.traverse((child) => {
                        if (child.userData.id === player.id) {
                        } else {
                            if (!this.otherPlayers.hasOwnProperty(player.id)) {
                                if (player.name === "") return;

                                const name = player.name.substring(0, 25);

                                const newAvatar = this.avatar.createAvatar(
                                    player.id,
                                    name
                                );

                                player["model"] = newAvatar.head;
                                player["nametag"] = newAvatar.nametag;
                                player["body"] = newAvatar.body;
                                this.scene.add(newAvatar.head);
                                this.scene.add(newAvatar.nametag);
                                this.scene.add(newAvatar.body);
                                this.otherPlayers[player.id] = player;
                            } else {
                                this.otherPlayers[player.id][
                                    "model"
                                ].position.set(
                                    player.position_x,
                                    player.position_y,
                                    player.position_z
                                );
                                this.otherPlayers[player.id][
                                    "model"
                                ].rotation.set(
                                    player.rotation_x,
                                    player.rotation_y,
                                    player.rotation_z
                                );
                                this.otherPlayers[player.id][
                                    "nametag"
                                ].position.set(
                                    player.position_x,
                                    player.position_y + 0.6,
                                    player.position_z
                                );
                                this.otherPlayers[player.id][
                                    "body"
                                ].position.set(
                                    player.position_x,
                                    player.position_y - 0.9,
                                    player.position_z
                                );
                            }
                        }
                    });
                }
            }
        });

        this.socket.on("removePlayer", (id) => {
            this.disconnectedPlayerId = id;

            this.otherPlayers[id]["nametag"].material.dispose();
            this.otherPlayers[id]["nametag"].geometry.dispose();
            this.scene.remove(this.otherPlayers[id]["nametag"]);

            this.otherPlayers[id]["body"].material.dispose();
            this.otherPlayers[id]["body"].geometry.dispose();
            this.scene.remove(this.otherPlayers[id]["body"]);

            this.otherPlayers[id]["model"].material.forEach((material) =>
                material.dispose()
            );
            this.otherPlayers[id]["model"].geometry.dispose();
            this.scene.remove(this.otherPlayers[id]["model"]);

            delete this.otherPlayers[id]["nametag"];
            delete this.otherPlayers[id]["body"];
            delete this.otherPlayers[id]["model"];
            delete this.otherPlayers[id];
        });
    }

    updatePlayerSocket() {
        this.socket.emit("updatePlayer", {
            position: this.player.body.position,
            rotation: this.player.body.rotation,
        });
    }

    onKeyDown = (e) => {
        if (document.activeElement === this.domElements.messageInput) return;

        console.log("firiting");
        this.player.directionOffset = Math.PI;

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

        // if (e.code === "KeyE") {
        // }

        if (e.code === "ShiftLeft") {
            this.actions.run = true;
            this.player.animation = "running";
        }

        if (e.code === "Space") {
            this.actions.jump = true;
            this.player.animation = "waving";
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
        const spawnPos = new THREE.Vector3(17.8838, 1.7 + 5, -3.72508);
        this.player.velocity = this.player.spawn.velocity;

        this.player.collider.start.copy(spawnPos);
        this.player.collider.end.copy(spawnPos);

        this.player.collider.end.y += this.player.height;
    }

    updateMovement() {
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
            if (this.actions.jump) {
                this.player.velocity.y = 24;
            }
        }

        let damping = Math.exp(-15 * this.time.delta) - 1;

        if (!this.player.onFloor) {
            this.player.velocity.y -= this.player.gravity * this.time.delta;
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

    updateAvatar() {
        this.avatar.avatar.position.copy(this.player.collider.end);
        this.avatar.avatar.position.y -= 1.56;
        this.avatar.update();

        this.player.avatar.body.position.y += 0.2;
    }

    updateRotation() {
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

        // Extras
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

    update() {
        this.updateMovement();
        this.updatePlayerSocket();
        this.updateAvatar();
        this.updateRotation();

        console.log(this.player.body.position);

        if (this.player.animation !== this.avatar.animation) {
            this.avatar.animation.play(this.player.animation);
        } else {
            this.avatar.animation.play("idle");
        }

        if (this.player.animation !== "idle") {
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
                0.1
            );
        }
    }
}

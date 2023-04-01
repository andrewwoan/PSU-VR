import * as THREE from "three";
import Experience from "../../Experience.js";

import { Capsule } from "three/examples/jsm/math/Capsule";

export default class Player {
    constructor() {
        this.experience = new Experience();
        this.time = this.experience.time;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;
        this.octree = this.experience.world.octree;
        this.resources = this.experience.resources;
        this.avatar = this.experience.world.avatar.avatar;
        this.socket = this.experience.socket;

        this.initPlayer();
        this.initControls();
        this.setPlayerSocket();

        this.addEventListeners();
    }

    initPlayer() {
        this.player = {};
        this.player.body = this.camera.perspectiveCamera;

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
        this.player.rotation = new THREE.Euler();
        this.player.rotation.order = "YXZ";

        this.player.velocity = new THREE.Vector3();
        this.player.direction = new THREE.Vector3();

        this.player.speedMultiplier = 0.8;

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
    }

    setPlayerSocket() {
        this.socket.on("setID", (setID) => {});

        this.socket.on("playerData", (playerData) => {
            // console.log(playerData);
            for (let player of playerData) {
                if (player.id !== this.socket.id) {
                    this.scene.traverse((child) => {
                        if (child.userData.id === player.id) {
                            child.position.set();
                        } else {
                            if (!this.otherPlayers.hasOwnProperty(player.id)) {
                                const geometry = new THREE.BoxGeometry(
                                    0.5,
                                    0.5,
                                    0.5
                                );
                                const material = new THREE.MeshBasicMaterial({
                                    color: 0x00ff00,
                                    side: THREE.DoubleSide,
                                    transparent: true,
                                    opacity: 0.9,
                                });

                                const otherPlayer = new THREE.Mesh(
                                    geometry,
                                    material
                                );

                                otherPlayer.rotation.order = "YXZ";
                                otherPlayer.userData = player.id;
                                player["model"] = otherPlayer;
                                this.scene.add(otherPlayer);
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
                            }
                        }
                    });
                }
            }
        });
    }

    updatePlayerSocket() {
        this.socket.emit("updatePlayer", {
            position: this.player.body.position,
            rotation: this.player.body.rotation,
        });
    }

    onDesktopPointerMove = (e) => {
        if (document.pointerLockElement !== document.body) return;
        this.player.body.rotation.order = this.player.rotation.order;

        this.player.body.rotation.x -= e.movementY / 500;
        this.player.body.rotation.y -= e.movementX / 500;

        this.player.body.rotation.x = THREE.MathUtils.clamp(
            this.player.body.rotation.x,
            -Math.PI / 2,
            Math.PI / 2
        );
    };

    onKeyDown = (e) => {
        if (document.pointerLockElement !== document.body) return;

        if (e.code === "KeyW") {
            this.actions.forward = true;
        }
        if (e.code === "KeyS") {
            this.actions.backward = true;
        }
        if (e.code === "KeyA") {
            this.actions.left = true;
        }
        if (e.code === "KeyD") {
            this.actions.right = true;
        }
        if (e.code === "KeyM") {
            if (this.resources.items.video.source.data.paused) {
                this.resources.items.video.source.data.play();
            } else {
                this.resources.items.video.source.data.pause();
            }
            this.resources.items.video.source.data.muted =
                !this.resources.items.video.source.data.muted;
        }

        if (e.code === "ShiftLeft") {
            this.actions.run = true;
        }

        if (e.code === "Space") {
            this.actions.jump = true;
        }
    };

    onKeyUp = (e) => {
        if (document.pointerLockElement !== document.body) return;

        if (e.code === "KeyW") {
            this.actions.forward = false;
        }
        if (e.code === "KeyS") {
            this.actions.backward = false;
        }
        if (e.code === "KeyA") {
            this.actions.left = false;
        }
        if (e.code === "KeyD") {
            this.actions.right = false;
        }

        if (e.code === "ShiftLeft") {
            this.actions.run = false;
        }

        if (e.code === "Space") {
            this.actions.jump = false;
        }
    };

    onPointerDown = (e) => {
        if (e.pointerType === "mouse") {
            document.body.requestPointerLock();
            return;
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

    addEventListeners() {
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
        document.addEventListener("pointermove", this.onDesktopPointerMove);
        this.experience.canvas.addEventListener(
            "pointerdown",
            this.onPointerDown
        );
    }

    resize() {}

    spawnPlayerOutOfBounds() {
        const spawnPos = new THREE.Vector3(17.8838, 1.7 + 5, -3.72508);
        this.player.velocity = this.player.spawn.velocity;
        this.player.body.position.copy(spawnPos);

        this.player.collider.start.copy(spawnPos);
        this.player.collider.end.copy(spawnPos);

        this.player.collider.end.y += this.player.height;
    }

    updateMovement() {
        const speed =
            (this.player.onFloor ? 1.75 : 0.2) *
            this.player.gravity *
            this.player.speedMultiplier;

        //The amount of distance we travel between each frame
        let speedDelta = this.time.delta * speed;

        if (this.actions.run) {
            speedDelta *= 1.7;
        }
        if (this.actions.forward) {
            this.player.velocity.add(
                this.getForwardVector().multiplyScalar(speedDelta)
            );
        }
        if (this.actions.backward) {
            this.player.velocity.add(
                this.getForwardVector().multiplyScalar(-speedDelta * 0.5)
            );
        }
        if (this.actions.left) {
            this.player.velocity.add(
                this.getSideVector().multiplyScalar(-speedDelta * 0.75)
            );
        }
        if (this.actions.right) {
            this.player.velocity.add(
                this.getSideVector().multiplyScalar(speedDelta * 0.75)
            );
        }

        if (this.player.onFloor) {
            if (this.actions.jump) {
                this.player.velocity.y = 20;
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

        this.player.body.position.copy(this.player.collider.end);
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
        const playerPos = this.player.body.position.clone();
        playerPos.z -= 1;
        this.avatar.position.copy(playerPos);
    }

    update() {
        this.updateMovement();
        // this.updateAvatar();
        this.updatePlayerSocket();
        // this.updateRaycaster();
    }
}

import * as THREE from "three";
import Experience from "../../Experience.js";
import { Capsule } from "three/examples/jsm/math/Capsule";

import nipplejs from "nipplejs";
import elements from "../../Utils/functions/elements.js";

import {
    MeshBVH,
    MeshBVHVisualizer,
    StaticGeometryGenerator,
} from "three-mesh-bvh";

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
        this.player.firstPersonFlag = true;
        this.player.avatar.body.rotation.order = "YXZ";
        this.player.avatar.head.rotation.order = "YXZ";
        this.player.avatar.body.material.opacity = 0;
        this.player.avatar.head.material.forEach((face) => {
            face.opacity = 0;
        });
        this.player.avatar.body.rotation.y = Math.PI / 2;
        this.player.avatar.head.rotation.y = Math.PI / 2;

        this.camera.controls.maxPolarAngle = Math.PI;
        this.camera.controls.minDistance = 1e-4;
        this.camera.controls.maxDistance = 1e-4;

        this.player.body.position
            .sub(this.camera.controls.target)
            .normalize()
            .multiplyScalar(10)
            .add(this.camera.controls.target);

        // this.scene.add(this.player.avatar.body);
        // this.scene.add(this.player.avatar.head);

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
            // console.log(data.vector);
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
        // if (document.pointerLockElement !== document.body) return;
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

        // if (e.code === "KeyM") {
        //     if (this.resources.items.video.source.data.paused) {
        //         this.resources.items.video.source.data.play();
        //     } else {
        //         this.resources.items.video.source.data.pause();
        //     }
        //     this.resources.items.video.source.data.muted =
        //         !this.resources.items.video.source.data.muted;
        // }

        if (e.code === "ShiftLeft") {
            this.actions.run = true;
        }

        if (e.code === "Space") {
            this.actions.jump = true;
        }
    };

    onKeyUp = (e) => {
        // if (document.pointerLockElement !== document.body) return;

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

        if (e.code === "Space") {
            this.actions.jump = false;
        }
    };

    onPointerDown = (e) => {
        this.actions.down = true;

        this.coords.previousX = e.screenX;
        this.coords.previousY = e.screenY;
    };

    onPointerUp = (e) => {
        this.actions.down = false;
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

    onPointerMove = (e) => {
        e.preventDefault();

        if (!this.actions.down) return;

        this.coords.currentX = e.screenX;
        this.coords.currentY = e.screenY;

        let diffX = this.coords.currentX - this.coords.previousX;
        let diffY = this.coords.currentY - this.coords.previousY;

        if (this.player.firstPersonFlag) {
            this.player.body.rotation.order = "YXZ";

            this.player.body.rotation.x -=
                diffY / this.camera.perspectiveCamera.zoom / 200;

            this.player.body.rotation.y -=
                diffX / this.camera.perspectiveCamera.zoom / 200;

            this.player.body.rotation.x = THREE.MathUtils.clamp(
                this.player.body.rotation.x,
                -Math.PI / 2 + 0.001,
                Math.PI / 2 - 0.001
            );
        } else {
            this.player.avatar.body.rotation.order = "YXZ";
            this.player.avatar.head.rotation.order = "YXZ";

            this.player.avatar.body.rotation.y -=
                diffX / this.camera.perspectiveCamera.zoom / 200;
            this.player.avatar.head.rotation.y -=
                diffX / this.camera.perspectiveCamera.zoom / 200;
        }

        this.coords.previousX = e.screenX;
        this.coords.previousY = e.screenY;
    };

    onCameraChange = () => {
        this.player.firstPersonFlag = !this.player.firstPersonFlag;
        if (this.player.firstPersonFlag) {
            this.camera.controls.enableZoom = false;

            this.camera.controls.maxPolarAngle = Math.PI;
            this.camera.controls.minDistance = 1e-4;
            this.camera.controls.maxDistance = 1e-4;

            this.player.avatar.body.material.opacity = 0;
            this.player.avatar.head.material.forEach((face) => {
                face.opacity = 0;
            });

            this.player.body.position
                .sub(this.camera.controls.target)
                .normalize()
                .multiplyScalar(10)
                .add(this.camera.controls.target);
        } else {
            this.camera.controls.enableZoom = true;
            // this.camera.controls.zoomSpeed = 0.5;

            this.camera.controls.maxPolarAngle = Math.PI / 2;
            this.camera.controls.minDistance = 4;
            this.camera.controls.maxDistance = 8;

            this.player.avatar.body.material.opacity = 1;
            this.player.avatar.head.material.forEach((face) => {
                face.opacity = 1;
            });
        }
    };

    addEventListeners() {
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
        this.domElements.switchViewButton.addEventListener(
            "click",
            this.onCameraChange
        );
        // this.domElements.controlOverlay.addEventListener(
        //     "pointerdown",
        //     this.onPointerDown
        // );
        // this.domElements.controlOverlay.addEventListener(
        //     "pointerup",
        //     this.onPointerUp
        // );

        // this.domElements.controlOverlay.addEventListener(
        //     "pointermove",
        //     this.onPointerMove
        // );
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
            (this.player.onFloor ? 1.75 : 0.2) *
            this.player.gravity *
            this.player.speedMultiplier;

        //The amount of distance we travel between each frame
        let speedDelta = this.time.delta * speed;

        if (this.actions.movingJoyStick) {
            this.player.velocity.add(this.getJoyStickDirectionalVector());
        }

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

        this.player.body.position.sub(this.camera.controls.target);
        this.camera.controls.target.copy(this.player.collider.end);
        this.player.body.position.add(this.player.collider.end);

        if (this.player.firstPersonFlag === false) {
        } else {
            // this.player.body.position.sub(this.camera.controls.target);
            // this.camera.controls.target.copy(this.player.collider.end);
            // this.player.body.position.add(this.player.collider.end);
        }

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
        this.player.avatar.body.position.copy(this.player.collider.start);
        this.player.avatar.head.position.copy(this.player.collider.end);
        this.avatar.avatar.position.copy(this.player.collider.end);
        this.avatar.avatar.position.y -= 1.56;
        this.avatar.update();

        if (!this.player.firstPersonFlag) {
            this.player.avatar.body.position.y += 0.2;
        }
    }

    update() {
        this.updateMovement();
        this.updatePlayerSocket();
        this.updateAvatar();

        const direction = new THREE.Vector3();
        this.camera.controls.target
            .clone()
            .sub(this.player.body.position)
            .normalize()
            .negate(direction);

        // Set the character's rotation to face in that direction
        this.avatar.avatar.rotation.y = Math.atan2(
            this.getForwardVector().x,
            this.getForwardVector().z
        );

        // this.avatar.avatar.quaternion.copy(this.getForwardVector());
        // this.updateRaycaster();

        // if (this.otherPlayers[this.disconnectedPlayerId]) {
        //     console.log(this.otherPlayers[this.disconnectedPlayerId]["model"]);
        // }

        // console.log(this.socket.id);
        // console.log(this.disconnectedPlayerId);
    }
}

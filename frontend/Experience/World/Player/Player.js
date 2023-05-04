import * as THREE from "three";
import Experience from "../../Experience.js";

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
        // this.player.avatar.children[0].material.opacity = 0;

        this.camera.controls.maxPolarAngle = Math.PI;
        this.camera.controls.minDistance = 1e-4;
        this.camera.controls.maxDistance = 1e-4;

        this.player.body.position
            .sub(this.camera.controls.target)
            .normalize()
            .multiplyScalar(10)
            .add(this.camera.controls.target);

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

        this.player.speedMultiplier = 0.35;

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

    resize() {}

    update() {}
}

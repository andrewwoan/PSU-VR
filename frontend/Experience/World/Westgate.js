import Experience from "../Experience.js";
import * as THREE from "three";

export default class Westgate {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.octree = this.experience.world.octree;

        this.setWorld();
    }

    setWorld() {
        this.boxes = this.resources.items.boxes.scene;
        this.chairs = this.resources.items.chairs.scene;
        this.extras = this.resources.items.extras.scene;
        this.floor = this.resources.items.floor.scene;
        this.gates = this.resources.items.gates.scene;
        this.outside = this.resources.items.outside.scene;
        this.signs = this.resources.items.signs.scene;
        this.stairs = this.resources.items.stairs.scene;
        this.tables = this.resources.items.tables.scene;
        this.walls = this.resources.items.walls.scene;
        this.door = this.resources.items.door.scene;
        this.glass = this.resources.items.glass.scene;
        this.screen = this.resources.items.screen.scene;

        // this.screen.children[0].material = new THREE.MeshBasicMaterial({
        //     map: this.resources.items.video,
        // });

        this.screen.children[0].material.flipY = false;

        this.collider = this.resources.items.collider.scene;
        this.octree.fromGraphNode(this.collider);

        this.door.children.forEach((child) => {
            this.resources.items.doorTexture.flipY = false;
            this.resources.items.doorTexture.colorSpace = THREE.SRGBColorSpace;
            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.doorTexture,
            });
        });
        this.glass.children.forEach((child) => {
            child.material = new THREE.MeshPhysicalMaterial();
            child.material.roughness = 0;
            child.material.color.set(0x5a7daa);
            child.material.ior = 1;
            child.material.transmission = 1;
            child.material.opacity = 1;
        });

        this.boxes.children.forEach((child) => {
            this.resources.items.boxesTexture.flipY = false;
            this.resources.items.boxesTexture.colorSpace = THREE.SRGBColorSpace;
            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.boxesTexture,
            });
        });
        this.chairs.children.forEach((child) => {
            this.resources.items.chairsTexture.flipY = false;
            this.resources.items.chairsTexture.colorSpace =
                THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.chairsTexture,
            });
        });
        this.extras.children.forEach((child) => {
            this.resources.items.extrasTexture.flipY = false;
            this.resources.items.extrasTexture.colorSpace =
                THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.extrasTexture,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
            });
        });
        this.floor.children.forEach((child) => {
            this.resources.items.floorTexture.flipY = false;
            this.resources.items.floorTexture.colorSpace = THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.floorTexture,
            });
        });
        this.gates.children.forEach((child) => {
            this.resources.items.gatesTexture.flipY = false;
            this.resources.items.gatesTexture.colorSpace = THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.gatesTexture,
            });
        });
        this.outside.children.forEach((child) => {
            this.resources.items.outsideTexture.flipY = false;
            this.resources.items.outsideTexture.colorSpace =
                THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.outsideTexture,
            });
        });
        this.signs.children.forEach((child) => {
            this.resources.items.signsTexture.flipY = false;
            this.resources.items.signsTexture.colorSpace = THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.signsTexture,
            });
        });
        this.stairs.children.forEach((child) => {
            this.resources.items.stairsTexture.flipY = false;
            this.resources.items.stairsTexture.colorSpace =
                THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.stairsTexture,
            });
        });
        this.tables.children.forEach((child) => {
            this.resources.items.tablesTexture.flipY = false;
            this.resources.items.tablesTexture.colorSpace =
                THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.tablesTexture,
            });
        });
        this.walls.children.forEach((child) => {
            this.resources.items.wallsTexture.flipY = false;
            this.resources.items.wallsTexture.colorSpace = THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.wallsTexture,
            });
        });

        this.scene.add(this.screen);
        this.scene.add(this.glass);
        this.scene.add(this.door);
        this.scene.add(this.boxes);
        this.scene.add(this.chairs);
        this.scene.add(this.extras);
        this.scene.add(this.floor);
        this.scene.add(this.gates);
        this.scene.add(this.outside);
        this.scene.add(this.signs);
        this.scene.add(this.stairs);
        this.scene.add(this.tables);
        this.scene.add(this.walls);
    }
}

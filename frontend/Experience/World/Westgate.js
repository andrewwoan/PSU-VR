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
        this.bars = this.resources.items.bars.scene;
        this.brick = this.resources.items.brick.scene;
        this.buildings = this.resources.items.buildings.scene;
        this.easter = this.resources.items.easter.scene;
        this.everything = this.resources.items.everything.scene;
        this.floor = this.resources.items.floor.scene;
        this.grass = this.resources.items.grass.scene;
        this.other = this.resources.items.other.scene;
        this.outside = this.resources.items.outside.scene;
        this.panera = this.resources.items.panera.scene;
        this.plastic = this.resources.items.plastic.scene;
        this.tables = this.resources.items.tables.scene;
        this.thirdfloor = this.resources.items.thirdfloor.scene;
        this.box = this.resources.items.box.scene;

        this.glass = this.resources.items.glass.scene;
        this.screen = this.resources.items.screen.scene;

        this.screen.children[0].material = new THREE.MeshBasicMaterial({
            map: this.resources.items.video,
        });

        this.screen.children[0].material.flipY = false;

        this.collider = this.resources.items.collider.scene;
        this.octree.fromGraphNode(this.collider);

        this.glass.children.forEach((child) => {
            child.material = new THREE.MeshPhysicalMaterial();
            child.material.roughness = 0;
            child.material.color.set(0xdfe5f5);
            child.material.ior = 1.5;
            child.material.transmission = 1;
            child.material.opacity = 1;

            // child.material = new THREE.MeshBasicMaterial({
            //     color: 0x949baf,
            //     transparent: true,
            //     opacity: 0.4,
            // });
        });

        this.box.children.forEach((child) => {
            this.resources.items.boxTexture.flipY = false;
            this.resources.items.boxTexture.colorSpace = THREE.SRGBColorSpace;
            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.boxTexture,
            });
        });
        this.bars.children.forEach((child) => {
            this.resources.items.barsTexture.flipY = false;
            this.resources.items.barsTexture.colorSpace = THREE.SRGBColorSpace;
            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.barsTexture,
            });
        });
        this.brick.children.forEach((child) => {
            this.resources.items.brickTexture.flipY = false;
            this.resources.items.brickTexture.colorSpace = THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.brickTexture,
            });
        });
        this.buildings.children.forEach((child) => {
            this.resources.items.buildingsTexture.flipY = false;
            this.resources.items.buildingsTexture.colorSpace =
                THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.buildingsTexture,
            });
        });
        this.easter.children.forEach((child) => {
            this.resources.items.easterTexture.flipY = false;
            this.resources.items.easterTexture.colorSpace =
                THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.easterTexture,
            });
        });
        this.everything.children.forEach((child) => {
            this.resources.items.everythingTexture.flipY = false;
            this.resources.items.everythingTexture.colorSpace =
                THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.everythingTexture,
            });
        });
        this.floor.children.forEach((child) => {
            this.resources.items.floorTexture.flipY = false;
            this.resources.items.floorTexture.colorSpace = THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.floorTexture,
            });
        });
        this.grass.children.forEach((child) => {
            this.resources.items.grassTexture.flipY = false;
            this.resources.items.grassTexture.colorSpace = THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.grassTexture,
            });
        });
        this.other.children.forEach((child) => {
            this.resources.items.otherTexture.flipY = false;
            this.resources.items.otherTexture.colorSpace = THREE.SRGBColorSpace;

            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.otherTexture,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
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

        this.panera.children.forEach((child) => {
            this.resources.items.paneraTexture.flipY = false;
            this.resources.items.paneraTexture.colorSpace =
                THREE.SRGBColorSpace;
            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.paneraTexture,
            });
        });

        this.plastic.children.forEach((child) => {
            this.resources.items.plasticTexture.flipY = false;
            this.resources.items.plasticTexture.colorSpace =
                THREE.SRGBColorSpace;
            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.plasticTexture,
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

        this.thirdfloor.children.forEach((child) => {
            this.resources.items.thirdfloorTexture.flipY = false;
            this.resources.items.thirdfloorTexture.colorSpace =
                THREE.SRGBColorSpace;
            child.material = new THREE.MeshBasicMaterial({
                map: this.resources.items.thirdfloorTexture,
            });
        });

        this.scene.add(this.glass);
        this.scene.add(this.screen);

        this.scene.add(this.bars);
        this.scene.add(this.brick);
        this.scene.add(this.buildings);
        this.scene.add(this.easter);
        this.scene.add(this.everything);
        this.scene.add(this.floor);
        this.scene.add(this.grass);
        this.scene.add(this.other);
        this.scene.add(this.outside);
        this.scene.add(this.panera);
        this.scene.add(this.plastic);
        this.scene.add(this.box);
        this.scene.add(this.tables);
        this.scene.add(this.thirdfloor);
    }
}

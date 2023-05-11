import Experience from "../Experience.js";
import * as THREE from "three";

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        this.setEnvironment();
    }

    setEnvironment() {
        this.environmentMap = {};
        this.environmentMap.intensity = 0;
        this.environmentMap.texture = this.resources.items.environment;
        this.environmentMap.texture.outputColorSpace = THREE.SRGBColorSpace;

        this.scene.background = this.environmentMap.texture;

        const light = new THREE.AmbientLight(0x404040, 4); // soft white light
        this.scene.add(light);

        this.sunLight = new THREE.DirectionalLight("#ffffff", 1.5);

        this.sunLight.position.set(1.5, 7, -3);
        this.scene.add(this.sunLight);

        // this.scene.environment = this.environmentMap.texture;

        // console.log(this.scene);

        // this.environmentMap.updateMaterials = () => {
        //     this.scene.children.forEach((child) => {
        //         if (child instanceof THREE.Group) {
        //             console.log(child.children[0]);
        //             if (
        //                 child.children[0] instanceof THREE.Mesh &&
        //                 child.children[0].material instanceof
        //                     THREE.MeshPhysicalMaterial
        //             ) {
        //                 child.children[0].material.envMap =
        //                     this.environmentMap.texture;
        //                 child.children[0].material.envMapIntensity =
        //                     this.environmentMap.intensity;
        //                 child.children[0].material.needsUpdate = true;
        //             }
        //         }
        //     });
        // };
        // this.environmentMap.updateMaterials();
    }

    update() {}
}

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
        this.environmentMap.texture.encoding = THREE.sRGBEncoding;

        this.scene.background = this.environmentMap.texture;

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

        // if (this.debug.active) {
        //     this.debugFolder
        //         .add(this.environmentMap, "intensity")
        //         .name("envMapIntensity")
        //         .min(0)
        //         .max(4)
        //         .step(0.001)
        //         .onChange(this.environmentMap.updateMaterials);
        // }
    }

    update() {}
}

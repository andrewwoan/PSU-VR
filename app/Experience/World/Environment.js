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

        // this.environmentMap.updateMaterials = () => {
        //     this.scene.traverse((child) => {
        //         if (
        //             child instanceof THREE.Mesh &&
        //             child.material instanceof THREE.MeshStandardMaterial
        //         ) {
        //             child.material.envMap = this.environmentMap.texture;
        //             child.material.envMapIntensity =
        //                 this.environmentMap.intensity;
        //             child.material.needsUpdate = true;
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

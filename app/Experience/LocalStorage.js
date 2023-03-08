import Experience from "./Experience.js";

export default class LocalStorage {
    constructor() {
        this.experience = new Experience();
        this.camera = this.experience.camera;

        this.initPlayerState();
        this.setStateObject();
    }

    initPlayerState() {
        this.stringState = {
            playerPosition: "whiterun|0|0|0",
            playerRotation: "0|0|0",
        };

        localStorage.clear();

        if (
            localStorage.getItem("playerPosition") &&
            localStorage.getItem("playerRotation")
        ) {
            this.stringState.playerPosition =
                localStorage.getItem("playerPosition");
            this.stringState.playerRotation =
                localStorage.getItem("playerRotation");
        } else {
            localStorage.setItem(
                "playerPosition",
                this.stringState.playerPosition
            );
            localStorage.setItem(
                "playerRotation",
                this.stringState.playerRotation
            );
        }
    }

    updateLocalStorage() {
        localStorage.setItem(
            "playerPosition",
            `${this.state.location}|${this.camera.perspectiveCamera.position.x}|${this.camera.perspectiveCamera.position.y}|${this.camera.perspectiveCamera.position.z}`
        );
        localStorage.setItem(
            "playerRotation",
            `${this.camera.perspectiveCamera.rotation._x}|${this.camera.perspectiveCamera.rotation._y}|${this.camera.perspectiveCamera.rotation._z}`
        );

        this.stringState.playerPosition =
            localStorage.getItem("playerPosition");
        this.stringState.playerRotation =
            localStorage.getItem("playerRotation");
    }

    setLocation(location) {
        this.state.location = location;
    }

    setStateObject() {
        this.state = {
            location: this.stringState.playerPosition.split("|")[0],

            posX: Number(this.stringState.playerPosition.split("|")[1]),
            posY: Number(this.stringState.playerPosition.split("|")[2]),
            posZ: Number(this.stringState.playerPosition.split("|")[3]),

            rotX: Number(this.stringState.playerRotation.split("|")[1]),
            rotY: Number(this.stringState.playerRotation.split("|")[2]),
            rotZ: Number(this.stringState.playerRotation.split("|")[3]),
        };
    }

    update() {
        this.updateLocalStorage();
        this.setStateObject();
    }
}

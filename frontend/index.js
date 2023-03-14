import "./index.scss";
import Experience from "./Experience/Experience.js";

import { io } from "socket.io-client";

const socketUrl = new URL("/", window.location.href);
socketUrl.host = "localhost:3000";

const socket = io(socketUrl.toString());

socket.on("connect", () => {
    console.log("Connected to server");
});

const experience = new Experience(
    document.querySelector("canvas.experience-canvas")
);

// import { io } from "socket.io-client";

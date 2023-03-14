import "./index.scss";
import Experience from "./Experience/Experience.js";
import { io } from "socket.io-client";
import elements from "./Experience/Utils/functions/elements.js";
// Experience ----------------------------------

const experience = new Experience(
    document.querySelector("canvas.experience-canvas")
);

// Frontend Server ----------------------------------

const socketUrl = new URL("/", window.location.href);
socketUrl.host = "localhost:3000";

const socket = io(socketUrl.toString());

socket.on("connect", () => {
    console.log("Connected to server with ID" + socket.id);
});

socket.emit("test", 10, "hi");

// import { io } from "socket.io-client";

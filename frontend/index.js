import "./index.scss";
import Experience from "./Experience/Experience.js";
import { io } from "socket.io-client";
import elements from "./Experience/Utils/functions/elements.js";

let domElements = elements({
    canvas: ".experience-canvas",
    messageSubmitButton: "#chat-message-button",
    chatContainer: ".chat-container",
});

// Experience ----------------------------------

const experience = new Experience(domElements.canvas);

// Frontend Server ----------------------------------

const socketUrl = new URL("/", window.location.href);
socketUrl.host = "localhost:3000";

const socket = io(socketUrl.toString());

socket.on("connect", () => {
    console.log("Connected to server with ID" + socket.id);
});

socket.emit("test", 10, "hi");

domElements.messageSubmitButton.addEventListener("click", (message) => {
    console.log("Clicked me bro");
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    domElements.chatContainer.append(messageDiv);
});

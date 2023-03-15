import "./index.scss";
import { io } from "socket.io-client";
import Experience from "./Experience/Experience.js";
import elements from "./Experience/Utils/functions/elements.js";

const domElements = elements({
    canvas: ".experience-canvas",
    chatContainer: ".chat-container",
    messageSubmitButton: "#chat-message-button",
    messageInput: "#chat-message-input",
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

domElements.messageSubmitButton.addEventListener("click", handleMessageSubmit);
domElements.messageInput.addEventListener("keydown", handleMessageSubmit);

function handleMessageSubmit(event) {
    if (
        event.type === "click" ||
        (event.key === "Enter" &&
            document.activeElement === domElements.messageInput)
    ) {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = `[${getTime()}]: ${
            domElements.messageInput.value
        }`;
        domElements.chatContainer.append(messageDiv);

        domElements.messageInput.value = "";
    }
}

function getTime() {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${minutes}`;
    return time;
}

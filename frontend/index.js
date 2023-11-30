import "./index.scss";
import { io } from "socket.io-client";
import Experience from "./Experience/Experience.js";
import elements from "./Experience/Utils/functions/elements.js";

// Dom Elements ----------------------------------

const domElements = elements({
    canvas: ".experience-canvas",
    chatContainer: ".chat-container",
    messageSubmitButton: "#chat-message-button",
    messageInput: "#chat-message-input",
    inputWrapper: ".message-input-wrapper",
    nameInputButton: "#name-input-button",
    nameInput: "#name-input",
    avatarLeftImg: ".avatar-left",
    avatarRightImg: ".avatar-right",
});

// Frontend Server ----------------------------------

const socketUrl = new URL("/", window.location.href);

// const socket = io(socketUrl.toString());
const chatSocket = io(socketUrl.toString() + "chat");
const updateSocket = io(socketUrl.toString() + "update");
let userName = "";

// Experience ----------------------------------

const experience = new Experience(domElements.canvas, updateSocket);

// Sockets ----------------------------------

chatSocket.on("connect", () => {
    // console.log("Connected to server with ID" + chatSocket.id);
});

domElements.messageSubmitButton.addEventListener("click", handleMessageSubmit);
domElements.nameInputButton.addEventListener("click", handleNameSubmit);
domElements.chatContainer.addEventListener("click", handleChatClick);
domElements.avatarLeftImg.addEventListener(
    "click",
    handleCharacterSelectionLeft
);
domElements.avatarRightImg.addEventListener(
    "click",
    handleCharacterSelectionRight
);
document.addEventListener("keydown", handleMessageSubmit);

function handleChatClick() {
    if (domElements.inputWrapper.classList.contains("hidden"))
        domElements.inputWrapper.classList.remove("hidden");
}

function handleNameSubmit() {
    userName = domElements.nameInput.value;
    chatSocket.emit("setName", userName);
    updateSocket.emit("setName", userName);
}

function handleCharacterSelectionLeft() {
    updateSocket.emit("setAvatar", "male");

    domElements.avatarLeftImg.removeEventListener(
        "click",
        handleCharacterSelectionLeft
    );
}
function handleCharacterSelectionRight() {
    updateSocket.emit("setAvatar", "female");

    domElements.avatarRightImg.removeEventListener(
        "click",
        handleCharacterSelectionRight
    );
}

function handleMessageSubmit(event) {
    if (event.type === "click" || event.key === "Enter") {
        domElements.inputWrapper.classList.toggle("hidden");
        domElements.messageInput.focus();

        if (domElements.messageInput.value === "") return;
        displayMessage(
            userName,
            domElements.messageInput.value.substring(0, 500),
            getTime()
        );
        chatSocket.emit(
            "send-message",
            domElements.messageInput.value.substring(0, 500),
            getTime()
        );
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

function displayMessage(name, message, time) {
    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = `<span class="different-color">[${time}] ${name}:</span> ${message}`;
    domElements.chatContainer.append(messageDiv);
    domElements.chatContainer.scrollTop =
        domElements.chatContainer.scrollHeight;
}

// Get data from server ----------------------------------

chatSocket.on("recieved-message", (name, message, time) => {
    displayMessage(name, message, time);
});

// Update Socket ----------------------------------------------------
updateSocket.on("connect", () => {});

const audio = document.getElementById("myAudio");

window.addEventListener("keydown", function (e) {
    if (e.code === "Equal") {
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        } else {
            audio.play();
        }
    }
});

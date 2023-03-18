import * as dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: "*",
    },
});

// Chat Name Space ----------------------------------------

const chatNameSpace = io.of("/chat");

chatNameSpace.on("connection", (socket) => {
    console.log(`${socket.id} has connected to chat namespace`);

    socket.on("disconnect", () => {
        console.log(`${socket.id} has disconnected`);
    });

    socket.on("send-message", (message, time) => {
        socket.broadcast.emit("recieved-message", message, time);
    });
});

// Update Name Space ----------------------------------------
const updateNameSpace = io.of("/update");

updateNameSpace.on("connection", (socket) => {
    console.log(`${socket.id} has connected to update namespace`);
    socket.emit("setID", { id: socket.id });

    socket.userData = { x: 0, y: 0, z: 0 };

    socket.on("disconnect", () => {
        console.log(`${socket.id} has disconnected`);
    });

    socket.on("initPlayer", (player) => {
        socket.userData.x = player.x;
        socket.userData.y = player.y;
        socket.userData.z = player.z;
    });

    socket.on("updatePlayer", (player) => {
        socket.userData.x = player.x;
        socket.userData.y = player.y;
        socket.userData.z = player.z;
    });
});

setInterval(() => {
    // Get the socket IDs in the namespace

    const socketIds = updateNameSpace.sockets.keys();
    const socketIdsArray = Array.from(socketIds);

    for (const id of socketIdsArray) {
        console.log(id);
    }
    let playerData = [];
}, 1000);

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

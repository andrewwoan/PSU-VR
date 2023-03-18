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

    socket.on("disconnect", () => {
        console.log(`${socket.id} has disconnected`);
    });

    socket.on("updatePlayer", (test) => {});
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

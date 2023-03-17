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

io.on("connection", (socket) => {
    const socketUrl = new URL(socket.handshake.headers.referer);
    console.log("A user has connected from", socketUrl.hostname);
    socket.on("send-message", (message, time) => {
        socket.broadcast.emit("recieved-message", message, time);
    });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

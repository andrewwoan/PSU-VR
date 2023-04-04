import * as dotenv from "dotenv";
import express from "express";
import path from "path";
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

app.use(express.static("dist"));

const indexPath = path.join(process.cwd(), "dist", "index.html");

app.get("*", (req, res) => {
    res.sendFile(indexPath);
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

const connectedSockets = new Map();

updateNameSpace.on("connection", (socket) => {
    console.log(`${socket.id} has connected to update namespace`);

    socket.on("setID", () => {
        updateNameSpace.emit("setID", socket.id);
    });

    connectedSockets.set(socket.id, socket);

    socket.userData = {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    };

    socket.on("disconnect", () => {
        console.log(`${socket.id} has disconnected`);
        connectedSockets.delete(socket.id);
        updateNameSpace.emit("removePlayer", socket.id);
    });

    socket.on("initPlayer", (player) => {
        // console.log(player);
    });

    socket.on("updatePlayer", (player) => {
        socket.userData.position.x = player.position.x;
        socket.userData.position.y = player.position.y;
        socket.userData.position.z = player.position.z;
        socket.userData.rotation.x = player.rotation._x;
        socket.userData.rotation.y = player.rotation._y;
        socket.userData.rotation.z = player.rotation._z;

        const playerData = [];
        for (const socket of connectedSockets.values()) {
            playerData.push({
                id: socket.id,
                position_x: socket.userData.position.x,
                position_y: socket.userData.position.y,
                position_z: socket.userData.position.z,
                rotation_x: socket.userData.rotation.x,
                rotation_y: socket.userData.rotation.y,
                rotation_z: socket.userData.rotation.z,
            });
        }

        updateNameSpace.emit("playerData", playerData);
    });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

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
    socket.userData = {
        name: "",
    };
    console.log(`${socket.id} has connected to chat namespace`);

    socket.on("disconnect", () => {
        console.log(`${socket.id} has disconnected`);
    });

    socket.on("setName", (name) => {
        socket.userData.name = name;
    });

    socket.on("send-message", (message, time) => {
        socket.broadcast.emit(
            "recieved-message",
            socket.userData.name,
            message,
            time
        );
    });
});

// Update Name Space ----------------------------------------
const updateNameSpace = io.of("/update");

const connectedSockets = new Map();

updateNameSpace.on("connection", (socket) => {
    socket.userData = {
        position: { x: 0, y: -500, z: -500 },
        quaternion: { x: 0, y: 0, z: 0, w: 0 },
        animation: "idle",
        name: "",
        avatarSkin: "",
    };
    connectedSockets.set(socket.id, socket);

    console.log(`${socket.id} has connected to update namespace`);

    socket.on("setID", () => {
        updateNameSpace.emit("setID", socket.id);
    });

    socket.on("setName", (name) => {
        socket.userData.name = name;
    });

    socket.on("setAvatar", (avatarSkin) => {
        // console.log("setting avatar " + avatarSkin);
        updateNameSpace.emit("setAvatarSkin", avatarSkin, socket.id);
    });

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
        socket.userData.quaternion.x = player.quaternion[0];
        socket.userData.quaternion.y = player.quaternion[1];
        socket.userData.quaternion.z = player.quaternion[2];
        socket.userData.quaternion.w = player.quaternion[3];
        socket.userData.animation = player.animation;
        socket.userData.avatarSkin = player.avatarSkin;
    });

    setInterval(() => {
        const playerData = [];
        for (const socket of connectedSockets.values()) {
            if (
                socket.userData.name !== "" &&
                socket.userData.avatarSkin !== ""
            ) {
                playerData.push({
                    id: socket.id,
                    name: socket.userData.name,
                    position_x: socket.userData.position.x,
                    position_y: socket.userData.position.y,
                    position_z: socket.userData.position.z,
                    quaternion_x: socket.userData.quaternion.x,
                    quaternion_y: socket.userData.quaternion.y,
                    quaternion_z: socket.userData.quaternion.z,
                    quaternion_w: socket.userData.quaternion.w,
                    animation: socket.userData.animation,
                    avatarSkin: socket.userData.avatarSkin,
                });
            }
        }

        if (socket.userData.name === "" || socket.userData.avatarSkin === "") {
            return;
        } else {
            updateNameSpace.emit("playerData", playerData);
        }
    }, 20);
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

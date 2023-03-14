// import dotenv from "dotenv";
// import express from "express";
// import http from "http";
// import path from "path";
// import * as socketio from "socket.io";

// const port = process.env.PORT || 3000;
// const app = express();
// const server = http.createServer(app);
// const io = new socketio.Server(server);

// const dirname = path.dirname(new URL(import.meta.url).pathname);
// app.use(express.static(path.join(dirname, "dist/assets")));

// io.on("connection", (socket) => {
//     console.log("A user has connected.");
// });

// server.listen(port, () => {
//     console.log("Listening on port: " + port);
// });

import express from "express";
import http from "http";
import { Server } from "socket.io";

import path from "path";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: "*",
    },
});

io.on("connection", (socket) => {
    const socketUrl = new URL(socket.handshake.headers.referer);
    console.log("A user has connected from", socketUrl.hostname);
});

server.listen(3000, () => {
    console.log("Server listening on port 3000.");
});

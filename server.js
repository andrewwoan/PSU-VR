import dotenv from "dotenv";
import express from "express";
import http from "http";
import path from "path";
import * as socketio from "socket.io";

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

const dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(dirname, "dist/assets")));

server.listen(port, () => {
    console.log("Listening on port: " + port);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let users = {};

io.on("connection", (socket) => {
    socket.on("join", (userId) => {
        users[socket.id] = userId;
        io.emit("updateUserList", Object.values(users));
    });

    socket.on("callUser", ({ to, offer }) => {
        io.to(to).emit("incomingCall", { from: socket.id, offer });
    });

    socket.on("answerCall", ({ to, answer }) => {
        io.to(to).emit("callAccepted", { answer });
    });

    socket.on("toggleAudio", ({ to, audio }) => {
        io.to(to).emit("audioToggled", { audio });
    });

    socket.on("toggleVideo", ({ to, video }) => {
        io.to(to).emit("videoToggled", { video });
    });

    socket.on("endCall", ({ to }) => {
        io.to(to).emit("callEnded");
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("updateUserList", Object.values(users));
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));

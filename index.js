const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let users = {};

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("join", (name) => {
        users[socket.id] = name;
        io.emit("updateUserList", Object.keys(users).map((id) => ({ id, name })));
    });

    socket.on("callUser", ({ to, offer }) => {
        io.to(to).emit("incomingCall", { from: socket.id, offer });
    });

    socket.on("answerCall", ({ to, answer }) => {
        io.to(to).emit("callAccepted", { answer });

        // ✅ Send Answer Call Notification
        io.to(to).emit("notification", { message: "Your call was answered!" });
    });

    socket.on("endCall", ({ to }) => {
        io.to(to).emit("callEnded");
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("updateUserList", Object.keys(users).map((id) => ({ id, name: users[id] })));
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));

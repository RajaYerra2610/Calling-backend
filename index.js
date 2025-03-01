const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" }, 
    transports: ["websocket", "polling"] 
});

let users = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Register user
    socket.on("register_user", (name) => {
        users[socket.id] = { id: socket.id, name };
        io.emit("update_users", Object.values(users));
    });

    // Handle call request
    socket.on("call_user", ({ to, signal, from, name }) => {
        io.to(to).emit("incoming_call", { from, name, signal });
    });

    // Answer call
    socket.on("answer_call", ({ signal, to }) => {
        io.to(to).emit("call_accepted", signal);
    });

    // End call
    socket.on("end_call", ({ to }) => {
        io.to(to).emit("call_ended");
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("update_users", Object.values(users));
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));

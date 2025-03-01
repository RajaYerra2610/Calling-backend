const express = require('express');

const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, transports: ["websocket", "polling"] });

let users = {}; // Store connected users

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Register a new user
    socket.on("register_user", (name) => {
        users[socket.id] = { id: socket.id, name };
        io.emit("update_users", Object.values(users)); // Send updated list to all users
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("update_users", Object.values(users));
        console.log("User disconnected:", socket.id);
    });
});

server.listen(5000, () => {
    console.log(`Server running on port ${5000}`);
});

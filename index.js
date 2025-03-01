const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" }, 
    transports: ["websocket", "polling"] 
});

// Store connected users
let users = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Register user
    socket.on("register_user", (name) => {
        users[socket.id] = { id: socket.id, name };
        console.log("User registered:", name);
        io.emit("update_users", Object.values(users));
    });

    // Handle call initiation
    socket.on("call_user", ({ userToCall, signalData, from }) => {
        console.log(`📞 Call request from ${from} to ${userToCall}`);
        if (users[userToCall]) {
            io.to(userToCall).emit("incoming_call", { from, signal: signalData });
        } else {
            console.log("❌ User not found:", userToCall);
        }
    });

    // Handle call answering
    socket.on("answer_call", ({ signal, to }) => {
        console.log(`✅ Call answered by ${to}`);
        io.to(to).emit("call_accepted", signal);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete users[socket.id];
        io.emit("update_users", Object.values(users));
    });
});

server.listen(5000, () => {
    console.log('Server running on port 5000');
});

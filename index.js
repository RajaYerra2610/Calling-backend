const express = require('express');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, transports: ["websocket", "polling"] });

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle call request
    socket.on("call_user", ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit("incoming_call", { signal: signalData, from, name });
    });

    // Handle answer call
    socket.on("answer_call", (data) => {
        io.to(data.to).emit("call_accepted", data.signal);
    });

    // Handle ICE Candidate Exchange
    socket.on("ice_candidate", (data) => {
        io.to(data.to).emit("ice_candidate", data.candidate);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(5000, () => {
    console.log(`Server running on port ${5000}`);
});

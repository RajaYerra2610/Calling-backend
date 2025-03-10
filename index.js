const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

// Setup Express & Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000" }, // Allow frontend access
});

const activeRooms = {};

app.use(cors());
app.use(express.json());

// Database Setup
const db = new sqlite3.Database("./database/calls.db", (err) => {
    if (err) console.error(err.message);
    else console.log("Connected to SQLite database.");
});

// Create Calls Table
db.run(
    `CREATE TABLE IF NOT EXISTS calls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caller TEXT,
        receiver TEXT,
        status TEXT, 
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
);

// Socket.io Signaling
io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // Handle Call Requests
    socket.on("call-user", (data) => {
        io.to(data.to).emit("incoming-call", { from: data.from, signal: data.signal });
    });

    socket.on("answer-call", (data) => {
        io.to(data.to).emit("call-answered", { from: data.from, signal: data.signal });
    });

    socket.on("end-call", (data) => {
        io.to(data.to).emit("call-ended", { from: data.from });

        // Save call record in database
        db.run("INSERT INTO calls (caller, receiver, status) VALUES (?, ?, ?)", [data.from, data.to, "ended"]);
    });

    // Room Handling
    socket.on("join-room", ({ roomId, userId }) => {
        if (!activeRooms[roomId]) activeRooms[roomId] = [];
        activeRooms[roomId].push(userId);
        socket.join(roomId);
        io.to(roomId).emit("user-joined", { userId });
    });

    socket.on("leave-room", ({ roomId, userId }) => {
        if (activeRooms[roomId]) {
            activeRooms[roomId] = activeRooms[roomId].filter((id) => id !== userId);
            if (activeRooms[roomId].length === 0) delete activeRooms[roomId];
        }
        socket.leave(roomId);
        io.to(roomId).emit("user-left", { userId });
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});

// Start Server
server.listen(5000, () => console.log("Server running on port 5000"));

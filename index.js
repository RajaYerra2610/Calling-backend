const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

let users = {}; // Store users { socketId: username }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When a user joins, store them and send an updated list
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("updateUserList", users);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id]; // Remove user
    io.emit("updateUserList", users); // Send updated user list
  });

  // Call a user
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("incomingCall", { signal: signalData, from, name });
  });

  // Answer a call
  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));

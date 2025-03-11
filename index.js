const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add user to the list
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("updateUserList", users);
  });

  // Handle call request
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("incomingCall", { signal: signalData, from, name });
  });

  // Answer call
  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  // Disconnect user
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("updateUserList", users);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));

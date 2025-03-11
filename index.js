const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

let users = {}; // Store connected users

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Add new user
  users[socket.id] = { id: socket.id };
  io.emit("userList", Object.values(users)); // Send updated user list

  socket.on("offer", (data) => {
    socket.to(data.target).emit("offer", { signal: data.signal, from: data.from });
  });

  socket.on("answer", (data) => {
    socket.to(data.target).emit("answer", { signal: data.signal });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id]; // Remove user
    io.emit("userList", Object.values(users)); // Update user list
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoute");
const messageRoutes = require("./routes/messagesRoute");
const socket = require("socket.io");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/message", messageRoutes);

const PORT = process.env.PORT;
const DATABASE_URL = process.env.MONGO_URL;

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    const server = app.listen(PORT, () =>
      console.log(`Server running on ${PORT}`)
    );

    const io = socket(server, {
      cors: {
        origin: "http://localhost:3000",
        credentials: true,
      },
    });

    global.onlineUsers = new Map();

    io.on("connection", (socket) => {
      global.chatSocket = socket;

      socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
      });

      socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
      });
    });

  })
  .catch((err) => console.log(err.message));

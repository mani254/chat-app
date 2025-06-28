import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import socketHandler from "./sockets";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002", "*"],
    methods: ["GET", "POST"],
  },
});

// Socket.IO Logic
io.on("connection", (socket) => {
  socketHandler(socket, io);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

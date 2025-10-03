import http from "http";
import { Socket, Server as SocketIOServer } from "socket.io";
import app from "./app";
import socketHandler from "./sockets";

const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "";

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: [frontendUrl],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO Logic
io.use(async (socket, next) => {
  // Authenticate using cookies before allowing connection
  const { authenticateSocket } = await import("./middleware/socketAuth");
  return authenticateSocket(socket as Socket, next);
});

io.on("connection", (socket) => {
  socketHandler(socket, io);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

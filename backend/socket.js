const { getAllowedOrigins, isProduction } = require("./config/env");

let io = null;

const buildSocketCorsOptions = () => {
  const allowedOrigins = getAllowedOrigins();

  if (!allowedOrigins.length) {
    return {
      origin: !isProduction,
      methods: ["GET", "POST", "PUT", "DELETE"],
    };
  }

  return {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  };
};

const initSocketServer = (server, socketIoServer) => {
  io = new socketIoServer(server, {
    cors: buildSocketCorsOptions(),
  });

  io.on("connection", (socket) => {
    socket.emit("realtime:connected", {
      connectedAt: new Date().toISOString(),
    });
  });

  return io;
};

const getSocketServer = () => io;

const emitRealtime = (eventName, payload = {}) => {
  if (!io) return;

  io.emit(eventName, {
    ...payload,
    emittedAt: new Date().toISOString(),
  });
};

module.exports = {
  initSocketServer,
  getSocketServer,
  emitRealtime,
};

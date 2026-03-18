let io = null;

const buildSocketCorsOptions = () => {
  if (!process.env.CORS_ORIGIN) {
    return {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    };
  }

  return {
    origin: process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
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

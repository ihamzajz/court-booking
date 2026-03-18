import { io } from "socket.io-client";

import { BASE_URL } from "../config/api";

let socket;

const getSocket = () => {
  if (!socket) {
    socket = io(BASE_URL, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    });
  }

  return socket;
};

export const connectRealtime = () => {
  const client = getSocket();

  if (!client.connected) {
    client.connect();
  }

  return client;
};

export const subscribeToRealtime = (events, callback) => {
  const client = connectRealtime();
  const eventList = Array.isArray(events) ? events : [events];

  eventList.forEach((eventName) => {
    client.on(eventName, callback);
  });

  return () => {
    eventList.forEach((eventName) => {
      client.off(eventName, callback);
    });
  };
};

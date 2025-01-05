import { Server } from "socket.io";

const activeUsers = new Map(); // Map to store userId and their socket IDs
let io; // Define io outside of any function

// Initialize and configure socket.io
function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow requests from any origin (adjust this as necessary)
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", (userId) => {
      activeUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    });

    socket.on("disconnect", () => {
      activeUsers.forEach((value, key) => {
        if (value === socket.id) {
          activeUsers.delete(key);
        }
      });
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

// Function to get the socket ID of a user
function getReceiverSocketId(userId) {
  return activeUsers.get(userId);
}

export { initializeSocket, getReceiverSocketId, activeUsers, io };

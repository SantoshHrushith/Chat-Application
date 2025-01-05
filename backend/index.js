import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { PORT, mongoDBURL } from "./config.js";
import userRoute from "./routes/userRoutes.js";
import messageRoute from "./routes/messageRoute.js";
import { initializeSocket } from "./socket/socket.js"; // Import socket setup

const app = express();
const httpServer = createServer(app); // Create an HTTP server

// Middleware
app.use(cors());
app.use(express.json());
app.use("/user", userRoute);
app.use("/message", messageRoute);

// MongoDB Connection
mongoose
  .connect(mongoDBURL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Initialize socket.io
const io = initializeSocket(httpServer); // Initialize socket.io with httpServer
export { io }; // Export io if needed elsewhere

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

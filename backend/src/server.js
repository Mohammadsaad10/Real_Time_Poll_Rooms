import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

const app = express();
const PORT = process.env.PORT || 5001;

import pollRoutes from "./routes/poll.route.js";
import { Socket } from "dgram";

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.set("trust proxy", true); //to get the correct client IP address when behind a proxy like nginx or in production environments. It tells Express to trust the X-Forwarded-For header, which contains the original client's IP address. This is important for accurate IP logging and for features that rely on the client's IP, such as rate limiting or geolocation.

app.use("/api/polls", pollRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Polling App API!");
});

const server = http.createServer(app); //http server created using express app to integrate with socket.io

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
}); //socket.io server instance created.

io.on("connection", (socket) => {
  console.log("user connected: ", socket.id);

  socket.on("joinPoll", (pollId) => {
    socket.join(pollId);
    console.log(`Socket ${socket.id} joined poll ${pollId}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });
});

//making it accessible in controllers to emit events when votes are cast.
app.set("io", io);

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });

//note to do :
//1. see how the id of the option is being passed in the frontend and how to access it in the backend.

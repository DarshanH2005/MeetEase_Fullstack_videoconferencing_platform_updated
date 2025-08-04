import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";
import userroutes from "./routes/users.routes.js";
import authroutes from "./routes/auth.routes.js";
import healthroutes from "./routes/health.routes.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { connecttosocket } from "./controllers/socketManager.js";
import dotenv from "dotenv";
import httpStatus from "http-status";
import { Server } from "socket.io";
import passport from "./config/passport.js";

// Load environment variables
dotenv.config();

console.log("🚀 Starting MeetEase Backend...");
console.log("📍 Environment:", process.env.NODE_ENV || "development");
console.log("🔌 Port:", process.env.PORT || 8000);

const app = express();
const server = createServer(app);
let io;

app.set("port", process.env.PORT || 8000);

// CORS configuration for development
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "https://meet-ease-fullstack-videoconferenci.vercel.app",
          ];
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Health check endpoint for frontend wakeup
app.get("/api/v1/ping", (req, res) => {
  res.status(200).json({ message: "pong", status: "ok" });
});

app.use("/api/v1/users", userroutes);
app.use("/api/v1/auth", authroutes);
app.use("/api/v1", healthroutes);

app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res
    .status(err.status || httpStatus.INTERNAL_SERVER_ERROR)
    .json({ message: err.message || "Something went wrong" });
});

const start = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://darshan1970h:MUjdqTUP9nmG2Vhl@zoom.qqgjf.mongodb.net/?retryWrites=true&w=majority&appName=Zoom";

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    io = connecttosocket(server);
    const port = process.env.PORT || 8000;
    server.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`🌐 Server URL: http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("❌ Full error:", error);
    process.exit(1);
  }
};

start();

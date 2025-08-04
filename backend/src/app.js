import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";
import userroutes from "./routes/users.routes.js";
import authroutes from "./routes/auth.routes.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { connecttosocket } from "./controllers/socketManager.js";
import dotenv from "dotenv";
import httpStatus from "http-status";
import { Server } from "socket.io";
import passport from "./config/passport.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
let io;

app.set("port", process.env.PORT || 8000);

// CORS configuration for development
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
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
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://darshan1970h:MUjdqTUP9nmG2Vhl@zoom.qqgjf.mongodb.net/?retryWrites=true&w=majority&appName=Zoom"
    );
    console.log("✅ Connected to MongoDB");

    io = connecttosocket(server);
    server.listen(process.env.PORT || 8000, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT || 8000}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

start();

import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";
import userroutes from "./routes/users.routes.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { connecttosocket } from "./controllers/socketManager.js";
import dotenv from "dotenv";
import httpStatus from "http-status";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
let io;

app.set("port", process.env.PORT || 8000);
// CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userroutes);

// Auth status endpoint
app.get("/auth/ping", (req, res) => {
  console.log("Ping received from:", req.headers.origin);
  const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "MeetEase Backend",
  });
});

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

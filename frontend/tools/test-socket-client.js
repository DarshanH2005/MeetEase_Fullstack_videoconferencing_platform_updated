const io = require("../node_modules/socket.io-client");

const endpoint = process.env.ENDPOINT || "http://localhost:8000";
console.log("Attempting socket.io connection to", endpoint);

const socket = io(endpoint, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  timeout: 20000,
});

socket.on("connect", () => {
  console.log("connected:", socket.id);
  socket.disconnect();
});

socket.on("connect_error", (err) => {
  console.error("connect_error:", err && err.message ? err.message : err);
  process.exit(1);
});

socket.on("disconnect", (reason) => {
  console.log("disconnected:", reason);
});

// keep alive for 15s
setTimeout(() => {
  console.log("test timeout, exiting");
  socket.disconnect();
  process.exit(0);
}, 15000);

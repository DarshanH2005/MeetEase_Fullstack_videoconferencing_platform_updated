import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import server from "../utils/environment";

export default function SocketDiagnostics() {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message, type = "info") => {
    setResults((prev) => [
      ...prev,
      { message, type, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const testSocket = async () => {
    setTesting(true);
    setResults([]);

    // Show what endpoint will be computed
    let computedSocketEndpoint = server;
    try {
      const apiSeg = computedSocketEndpoint.indexOf("/api/");
      if (apiSeg !== -1) {
        computedSocketEndpoint = computedSocketEndpoint.substring(0, apiSeg);
      } else {
        const apiPlain = computedSocketEndpoint.indexOf("/api");
        if (apiPlain !== -1) {
          computedSocketEndpoint = computedSocketEndpoint.substring(
            0,
            apiPlain
          );
        }
      }
      computedSocketEndpoint = computedSocketEndpoint.replace(/\/$/, "");
    } catch (e) {
      computedSocketEndpoint = server;
    }

    const originFallback =
      typeof window !== "undefined" && window.location && window.location.origin
        ? window.location.origin
        : computedSocketEndpoint;

    const debugOverride =
      typeof process !== "undefined" &&
      process.env &&
      process.env.NEXT_PUBLIC_SOCKET_OVERRIDE
        ? process.env.NEXT_PUBLIC_SOCKET_OVERRIDE
        : null;

    const socketBase =
      debugOverride || originFallback || computedSocketEndpoint;

    addResult(`Original server URL: ${server}`, "info");
    addResult(`Computed endpoint: ${computedSocketEndpoint}`, "info");
    addResult(`Origin fallback: ${originFallback}`, "info");
    addResult(`Debug override: ${debugOverride || "none"}`, "info");
    addResult(`Final socket base: ${socketBase}`, "success");

    // Test polling first
    addResult("Testing polling transport...", "info");
    try {
      const response = await fetch(
        `${socketBase}/socket.io/?EIO=4&transport=polling`
      );
      if (response.ok) {
        const text = await response.text();
        if (text.includes('{"sid"')) {
          addResult("✅ Polling handshake successful", "success");
        } else {
          addResult(
            `⚠️ Polling returned HTML (frontend): ${text.substring(0, 100)}...`,
            "warning"
          );
        }
      } else {
        addResult(
          `❌ Polling failed: ${response.status} ${response.statusText}`,
          "error"
        );
      }
    } catch (err) {
      addResult(`❌ Polling error: ${err.message}`, "error");
    }

    // Test WebSocket connection
    addResult("Testing WebSocket connection...", "info");
    const socket = io(socketBase, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: false,
    });

    socket.on("connect", () => {
      addResult(`✅ WebSocket connected: ${socket.id}`, "success");
      socket.disconnect();
      setTesting(false);
    });

    socket.on("connect_error", (err) => {
      addResult(`❌ Connect error: ${err.message || err}`, "error");
      setTesting(false);
    });

    socket.on("disconnect", () => {
      addResult("🔌 Disconnected", "info");
    });

    // Timeout
    setTimeout(() => {
      if (testing) {
        addResult("⏱️ Test timeout", "warning");
        socket.disconnect();
        setTesting(false);
      }
    }, 15000);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Socket.IO Diagnostics</h1>

      <button
        onClick={testSocket}
        disabled={testing}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: testing ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: testing ? "not-allowed" : "pointer",
        }}
      >
        {testing ? "Testing..." : "Run Socket Test"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <h3>Environment Variables to Set (if needed):</h3>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {`# In your Vercel dashboard or .env.local:
NEXT_PUBLIC_SOCKET_OVERRIDE=https://your-backend-host.onrender.com

# Or for local testing:
NEXT_PUBLIC_SOCKET_OVERRIDE=http://localhost:8000`}
        </pre>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Test Results:</h3>
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            border: "1px solid #ddd",
            padding: "10px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {results.map((result, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "5px",
                color:
                  result.type === "error"
                    ? "red"
                    : result.type === "success"
                    ? "green"
                    : result.type === "warning"
                    ? "orange"
                    : "black",
              }}
            >
              [{result.timestamp}] {result.message}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Quick Fixes:</h3>
        <ul>
          <li>
            If polling returns HTML: Your backend is not deployed or not
            reachable at the computed endpoint.
          </li>
          <li>
            If WebSocket fails: The host (Vercel) doesn't support WebSocket
            upgrades. Set NEXT_PUBLIC_SOCKET_OVERRIDE to your backend URL.
          </li>
          <li>
            If both fail: Check your backend deployment and ensure it's running
            on a WebSocket-capable service.
          </li>
        </ul>
      </div>
    </div>
  );
}

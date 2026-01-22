#!/usr/bin/env node

import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { WebSocketServer } from "ws";
import { handlers } from "./lib/ocpp-handlers";
import { store } from "./lib/store";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "9090");
const wsPort = parseInt(process.env.WS_PORT || "9000");

// Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Parse OCPP JSON-RPC messages
function parseMessage(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

// Format OCPP JSON-RPC response
function createResponse(messageId: string, payload: any) {
  return JSON.stringify([3, messageId, payload]);
}

function createError(
  messageId: string,
  errorCode: string,
  errorDescription: string,
) {
  return JSON.stringify([4, messageId, errorCode, errorDescription, {}]);
}

app.prepare().then(() => {
  // Create HTTP server for Next.js
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "/", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Next.js ready on http://${hostname}:${port}`);
  });

  // Create OCPP WebSocket server
  const wss = new WebSocketServer({ port: wsPort });

  wss.on("error", (error) => {
    console.error("❌ WebSocket Server Error:", error);
  });

  console.log(`> OCPP WebSocket server ready on ws://${hostname}:${wsPort}`);

  wss.on("connection", (ws, req) => {
    // Extract charge point ID from URL path
    const pathname = req.url || "/";
    const chargePointId = pathname.substring(1) || "UNKNOWN";

    console.log(`✅ Charge point connected: ${chargePointId}`);

    // Create client object
    const client = {
      identity: chargePointId,
      ws: ws,
      call: async function (action: string, payload: any) {
        return new Promise((resolve, reject) => {
          const messageId = Math.random().toString(36).substring(7);
          const message = JSON.stringify([2, messageId, action, payload]);

          // Store callback for response
          const timeout = setTimeout(() => {
            reject(new Error("Request timeout"));
          }, 30000);

          this.pendingCalls = this.pendingCalls || new Map();
          this.pendingCalls.set(messageId, { resolve, reject, timeout });

          ws.send(message);
        });
      },
      pendingCalls: new Map() as Map<string, any>,
    };

    store.setConnection(chargePointId, client);
    store.addLog({
      chargePointId,
      type: "CONNECT",
      action: null,
      payload: null,
    });

    ws.on("message", async (data) => {
      const message = parseMessage(data.toString());

      if (!message || !Array.isArray(message)) {
        ws.send(createError("", "ProtocolError", "Invalid message format"));
        return;
      }

      const [messageType, messageId, ...rest] = message;

      // Handle CALL (client request)
      if (messageType === 2) {
        const [action, payload] = rest;

        console.log(`📨 ${chargePointId} -> ${action}`);

        try {
          const handler = handlers[action as keyof typeof handlers];
          if (!handler) {
            ws.send(
              createError(
                messageId,
                "NotImplemented",
                `Action ${action} not supported`,
              ),
            );
            return;
          }

          const response = await handler({ params: payload, client });
          ws.send(createResponse(messageId, response));
        } catch (error) {
          console.error(`Error handling ${action}:`, error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          ws.send(createError(messageId, "InternalError", errorMessage));
        }
      }

      // Handle CALLRESULT (response to our request)
      else if (messageType === 3) {
        const [payload] = rest;
        const pending = client.pendingCalls.get(messageId);
        if (pending) {
          clearTimeout(pending.timeout);
          pending.resolve(payload);
          client.pendingCalls.delete(messageId);
        }
      }

      // Handle CALLERROR (error response to our request)
      else if (messageType === 4) {
        const [errorCode, errorDescription] = rest;
        const pending = client.pendingCalls.get(messageId);
        if (pending) {
          clearTimeout(pending.timeout);
          pending.reject(new Error(`${errorCode}: ${errorDescription}`));
          client.pendingCalls.delete(messageId);
        }
      }
    });

    ws.on("close", () => {
      console.log(`❌ Charge point disconnected: ${chargePointId}`);
      store.deleteConnection(chargePointId);
      store.addLog({
        chargePointId,
        type: "DISCONNECT",
        action: null,
        payload: null,
      });

      // Reject all pending calls
      client.pendingCalls.forEach(({ reject, timeout }) => {
        clearTimeout(timeout);
        reject(new Error("Connection closed"));
      });
      client.pendingCalls.clear();
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for ${chargePointId}:`, error);
    });
  });

  console.log(
    "\n📘 Connect your OCPP client to: ws://localhost:9000/{chargePointId}\n",
  );
});

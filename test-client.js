#!/usr/bin/env node

/**
 * Simple OCPP 1.6 Test Client
 *
 * Usage: node test-client.js [chargePointId]
 * Example: node test-client.js CP001
 */

const WebSocket = require("ws");

const chargePointId = process.argv[2] || "TEST_CP_001";
const wsUrl = `ws://localhost:9000/${chargePointId}`;

console.log(`🔌 Connecting to CSMS at ${wsUrl}...`);

const ws = new WebSocket(wsUrl, "ocpp1.6");

let messageCounter = 0;

function generateMessageId() {
  return `msg-${Date.now()}-${++messageCounter}`;
}

function sendMessage(action, payload) {
  const message = [2, generateMessageId(), action, payload];
  const jsonMessage = JSON.stringify(message);
  console.log(`\n📤 Sending ${action}:`, JSON.stringify(payload, null, 2));
  ws.send(jsonMessage);
}

ws.on("open", () => {
  console.log("✅ Connected to CSMS\n");

  // Send BootNotification
  sendMessage("BootNotification", {
    chargePointVendor: "TestVendor",
    chargePointModel: "TestModel",
    chargePointSerialNumber: "SN-12345",
    firmwareVersion: "1.0.0",
  });

  // Send Heartbeat after 2 seconds
  setTimeout(() => {
    sendMessage("Heartbeat", {});
  }, 2000);

  // Send StatusNotification after 3 seconds
  setTimeout(() => {
    sendMessage("StatusNotification", {
      connectorId: 0,
      errorCode: "NoError",
      status: "Available",
    });
  }, 3000);

  // Send Authorize after 4 seconds
  setTimeout(() => {
    sendMessage("Authorize", {
      idTag: "RFID12345",
    });
  }, 4000);

  // Send StartTransaction after 5 seconds
  setTimeout(() => {
    sendMessage("StartTransaction", {
      connectorId: 1,
      idTag: "RFID12345",
      meterStart: 0,
      timestamp: new Date().toISOString(),
    });
  }, 5000);

  // Send MeterValues after 7 seconds
  setTimeout(() => {
    sendMessage("MeterValues", {
      connectorId: 1,
      meterValue: [
        {
          timestamp: new Date().toISOString(),
          sampledValue: [
            {
              value: "1500",
              unit: "Wh",
              measurand: "Energy.Active.Import.Register",
            },
          ],
        },
      ],
    });
  }, 7000);

  // Send StopTransaction after 9 seconds
  setTimeout(() => {
    sendMessage("StopTransaction", {
      transactionId: 12345,
      idTag: "RFID12345",
      meterStop: 3000,
      timestamp: new Date().toISOString(),
    });
  }, 9000);

  // Close connection after 11 seconds
  setTimeout(() => {
    console.log("\n👋 Closing connection...");
    ws.close();
  }, 11000);
});

ws.on("message", (data) => {
  const message = JSON.parse(data.toString());
  const [messageType, messageId, ...rest] = message;

  if (messageType === 3) {
    // CALLRESULT
    const payload = rest[0];
    console.log(`📥 Received response:`, JSON.stringify(payload, null, 2));
  } else if (messageType === 4) {
    // CALLERROR
    const [errorCode, errorDescription] = rest;
    console.error(`❌ Error: ${errorCode} - ${errorDescription}`);
  } else if (messageType === 2) {
    // CALL (server-initiated command)
    const [action, payload] = rest;
    console.log(
      `📨 Received command ${action}:`,
      JSON.stringify(payload, null, 2),
    );

    // Auto-respond to server commands
    const response = [3, messageId, { status: "Accepted" }];
    ws.send(JSON.stringify(response));
    console.log(`📤 Sent response: { status: 'Accepted' }`);
  }
});

ws.on("close", (code, reason) => {
  console.log(`\n❌ Disconnected (${code}): ${reason || "No reason provided"}`);
  process.exit(0);
});

ws.on("error", (error) => {
  console.error("❌ WebSocket error:", error.message);
  process.exit(1);
});

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\n\n👋 Received interrupt signal, closing connection...");
  ws.close();
  setTimeout(() => process.exit(0), 1000);
});

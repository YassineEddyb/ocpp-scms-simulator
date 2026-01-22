const WebSocket = require("ws");

console.log("🔌 Testing OCPP connection to ws://localhost:9000/TEST_CP...");

const ws = new WebSocket("ws://localhost:9000/TEST_CP", "ocpp1.6");

ws.on("open", () => {
  console.log("✅ Connected!");

  const bootNotification = [
    2,
    "1",
    "BootNotification",
    {
      chargePointVendor: "TestVendor",
      chargePointModel: "TestModel",
    },
  ];

  console.log("📤 Sending BootNotification...");
  ws.send(JSON.stringify(bootNotification));
});

ws.on("message", (data) => {
  console.log("📥 Received:", data.toString());
  setTimeout(() => {
    console.log("✅ Test successful!");
    ws.close();
    process.exit(0);
  }, 500);
});

ws.on("error", (error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});

ws.on("close", () => {
  console.log("👋 Connection closed");
});

setTimeout(() => {
  console.log("⏰ Timeout - closing");
  ws.close();
  process.exit(1);
}, 5000);

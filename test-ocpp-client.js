const WebSocket = require("ws");

const cpId = "TEST_CP_001";
const url = `ws://localhost:9000/${cpId}`;

console.log(`🔌 Connecting to ${url}...`);

const ws = new WebSocket(url, ["ocpp1.6"]);

ws.on("open", () => {
  console.log("✅ Connected to CSMS");

  // Send BootNotification
  const bootMsg = [
    2,
    "1",
    "BootNotification",
    {
      chargePointVendor: "Test Vendor",
      chargePointModel: "Test Model",
    },
  ];

  console.log("📤 Sending BootNotification...");
  ws.send(JSON.stringify(bootMsg));

  // Send StatusNotification after 1 second
  setTimeout(() => {
    const statusMsg = [
      2,
      "2",
      "StatusNotification",
      {
        connectorId: 1,
        errorCode: "NoError",
        status: "Available",
      },
    ];
    console.log("📤 Sending StatusNotification...");
    ws.send(JSON.stringify(statusMsg));

    // Close after another second
    setTimeout(() => {
      console.log("👋 Closing connection...");
      ws.close();
    }, 1000);
  }, 1000);
});

ws.on("message", (data) => {
  console.log("📥 Received:", data.toString());
});

ws.on("close", () => {
  console.log("❌ Connection closed");

  // Check logs after closing
  setTimeout(async () => {
    console.log("\n🔍 Checking logs via API...");
    const response = await fetch("http://localhost:9090/api/logs");
    const data = await response.json();
    console.log(`Found ${data.logs.length} logs:`);
    data.logs.forEach((log) => {
      console.log(`  - ${log.type}: ${log.action} (${log.chargePointId})`);
    });
    process.exit(0);
  }, 500);
});

ws.on("error", (error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});

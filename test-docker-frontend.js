const WebSocket = require("ws");

const cpId = "DOCKER_TEST_CP";
const url = `ws://localhost:9000/${cpId}`;

console.log(`🔌 Connecting to ${url}...`);

const ws = new WebSocket(url, ["ocpp1.6"]);

let receivedCount = 0;

ws.on("open", () => {
  console.log("✅ Connected to CSMS in Docker");

  // Send BootNotification
  const bootMsg = [
    2,
    "boot-1",
    "BootNotification",
    {
      chargePointVendor: "Docker Test",
      chargePointModel: "Test-V1",
    },
  ];

  console.log("📤 Sending BootNotification...");
  ws.send(JSON.stringify(bootMsg));
});

ws.on("message", (data) => {
  receivedCount++;
  console.log(`📥 Response ${receivedCount}:`, data.toString());

  if (receivedCount === 1) {
    // Send Heartbeat
    const heartbeat = [2, "hb-1", "Heartbeat", {}];
    console.log("📤 Sending Heartbeat...");
    ws.send(JSON.stringify(heartbeat));
  } else if (receivedCount === 2) {
    // Close after getting both responses
    setTimeout(() => {
      console.log("👋 Closing connection...");
      ws.close();
    }, 500);
  }
});

ws.on("close", () => {
  console.log("❌ Connection closed");

  // Check logs via API
  setTimeout(async () => {
    console.log("\n🔍 Fetching logs from frontend API...");
    try {
      const response = await fetch("http://localhost:9090/api/logs");
      const data = await response.json();

      // Filter only our test logs
      const ourLogs = data.logs.filter(
        (log) => log.chargePointId === "DOCKER_TEST_CP",
      );
      console.log(`\n✅ Found ${ourLogs.length} logs for ${cpId}:`);
      ourLogs.forEach((log, idx) => {
        console.log(
          `  ${idx + 1}. ${log.type}: ${log.action || "N/A"} at ${log.timestamp}`,
        );
      });

      if (ourLogs.length >= 4) {
        console.log("\n🎉 SUCCESS! Logs are appearing in the frontend!");
      } else {
        console.log(
          `\n⚠️  Expected at least 4 logs (CONNECT, BootNotification, Heartbeat, DISCONNECT), got ${ourLogs.length}`,
        );
      }

      process.exit(0);
    } catch (error) {
      console.error("❌ Error fetching logs:", error.message);
      process.exit(1);
    }
  }, 1000);
});

ws.on("error", (error) => {
  console.error("❌ WebSocket Error:", error.message);
  process.exit(1);
});

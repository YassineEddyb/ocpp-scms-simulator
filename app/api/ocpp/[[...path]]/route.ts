import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const upgradeHeader = request.headers.get("upgrade");

  if (upgradeHeader !== "websocket") {
    return NextResponse.json(
      {
        error: "Expected Upgrade: websocket",
        info: "This is an OCPP WebSocket endpoint. Connect using ws:// protocol at ws://localhost:9000/{chargePointId}",
      },
      { status: 426 },
    );
  }

  // In production with Next.js, WebSocket upgrade is handled differently
  // This is a placeholder - actual WebSocket handling happens at server level
  return new NextResponse("WebSocket endpoint", {
    status: 101,
    headers: {
      Upgrade: "websocket",
      Connection: "Upgrade",
    },
  });
}

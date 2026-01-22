import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ action: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { action } = await context.params;
    const body = await request.json();
    const { chargePointId, payload } = body;

    if (!chargePointId) {
      return NextResponse.json(
        { error: "Missing chargePointId" },
        { status: 400 },
      );
    }

    const client = store.getConnection(chargePointId);
    if (!client) {
      return NextResponse.json(
        { error: `Charge point ${chargePointId} not connected` },
        { status: 404 },
      );
    }

    // Send OCPP command to charge point
    const response = await client.call(action, payload || {});

    store.addLog({
      chargePointId,
      type: "OUT",
      action,
      payload: payload || {},
      response,
    });

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send command" },
      { status: 500 },
    );
  }
}

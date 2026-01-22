import { store } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

// GET all configurations
export async function GET() {
  const configs = store.getAllConfigs();
  return NextResponse.json({ configs });
}

// POST new configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chargePointId, action, response } = body;

    if (!chargePointId || !action || !response) {
      return NextResponse.json(
        { error: "Missing required fields: chargePointId, action, response" },
        { status: 400 },
      );
    }

    store.setConfig(chargePointId, action, response);

    return NextResponse.json({
      success: true,
      config: { chargePointId, action, response },
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

// DELETE configuration
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { chargePointId, action } = body;

    if (!chargePointId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: chargePointId, action" },
        { status: 400 },
      );
    }

    store.deleteConfig(chargePointId, action);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

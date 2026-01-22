import { store } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  const logs = store.getLogs(200);
  return NextResponse.json({ logs });
}

export async function DELETE() {
  store.clearLogs();
  return NextResponse.json({ success: true });
}

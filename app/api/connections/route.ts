import { store } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  const connections = store.getAllConnections();
  return NextResponse.json({ connections });
}

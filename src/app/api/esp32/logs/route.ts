import { NextRequest, NextResponse } from "next/server";

const ESP32_URL = process.env.NEXT_PUBLIC_ESP32_API_URL || "http://192.168.1.100";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "20";

  try {
    const response = await fetch(`${ESP32_URL}/api/logs?limit=${limit}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `ESP32 returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Cannot reach ESP32: ${message}` },
      { status: 503 }
    );
  }
}

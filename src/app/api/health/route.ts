import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const uptime = Math.floor(process.uptime());
    return NextResponse.json({ success: true, data: { status: 'ok', uptime } }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Health check failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { signToken } from '@/lib/auth';

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

function parseDurationToSeconds(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return fallback;
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit === 's') return amount;
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 60 * 60;
  if (unit === 'd') return amount * 60 * 60 * 24;
  return fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = refreshSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: parsed.data.refreshToken },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 });
    }

    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true }
    });

    const accessToken = signToken({ sub: tokenRecord.userId, email: tokenRecord.user.email });
    const expiresIn = 60 * 60 * 24;

    const refreshSeconds = parseDurationToSeconds(process.env.REFRESH_TOKEN_EXPIRES_IN, 60 * 60 * 24 * 7);
    const newRefreshToken = crypto.randomUUID();
    const refreshExpiresAt = new Date(Date.now() + refreshSeconds * 1000);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: tokenRecord.userId,
        expiresAt: refreshExpiresAt
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn
        }
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Refresh failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
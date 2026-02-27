import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { signToken, verifyPassword } from '@/lib/auth';
import crypto from 'crypto';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
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
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const accessToken = signToken({ sub: user.id, email: user.email });
    const expiresIn = 60 * 60 * 24;

    const refreshSeconds = parseDurationToSeconds(process.env.REFRESH_TOKEN_EXPIRES_IN, 60 * 60 * 24 * 7);
    const refreshToken = crypto.randomUUID();
    const refreshExpiresAt = new Date(Date.now() + refreshSeconds * 1000);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshExpiresAt
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          refreshToken,
          expiresIn,
          tokenType: 'Bearer'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import type { Todo } from '@prisma/client';

const createTodoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().datetime().optional()
});

function serializeTodo(todo: Todo) {
  return {
    id: todo.id,
    user_id: todo.userId,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    due_date: todo.dueDate ? todo.dueDate.toISOString() : null,
    created_at: todo.createdAt.toISOString(),
    updated_at: todo.updatedAt.toISOString()
  };
}

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const completedParam = searchParams.get('completed');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const completed = completedParam === null ? undefined : completedParam === 'true';
    const limit = limitParam ? Math.min(Number(limitParam), 100) : 50;
    const offset = offsetParam ? Number(offsetParam) : 0;

    const todos = await prisma.todo.findMany({
      where: {
        userId,
        ...(typeof completed === 'boolean' ? { completed } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: Number.isNaN(limit) ? 50 : limit,
      skip: Number.isNaN(offset) ? 0 : offset
    });

    return NextResponse.json({ success: true, data: todos.map(serializeTodo) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch todos';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = createTodoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const todo = await prisma.todo.create({
      data: {
        userId,
        title: parsed.data.title,
        description: parsed.data.description,
        dueDate: parsed.data.due_date ? new Date(parsed.data.due_date) : undefined
      }
    });

    return NextResponse.json({ success: true, data: serializeTodo(todo) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create todo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
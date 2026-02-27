import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';
import type { Todo } from '@prisma/client';

const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  due_date: z.union([z.string().datetime(), z.null()]).optional()
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const todo = await prisma.todo.findUnique({ where: { id: params.id } });
    if (!todo) {
      return NextResponse.json({ success: false, error: 'Todo not found' }, { status: 404 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: serializeTodo(todo) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch todo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.todo.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Todo not found' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateTodoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const data: {
      title?: string;
      description?: string | null;
      completed?: boolean;
      dueDate?: Date | null;
    } = {};

    if (typeof parsed.data.title === 'string') data.title = parsed.data.title;
    if (typeof parsed.data.description === 'string') data.description = parsed.data.description;
    if (typeof parsed.data.completed === 'boolean') data.completed = parsed.data.completed;
    if (parsed.data.due_date !== undefined) {
      data.dueDate = parsed.data.due_date === null ? null : new Date(parsed.data.due_date);
    }

    const todo = await prisma.todo.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json({ success: true, data: serializeTodo(todo) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update todo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.todo.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Todo not found' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.todo.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: null }, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete todo';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/providers/ToastProvider';
import { useAuth } from '@/providers/AuthProvider';

interface Todo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!loading && !isAuthenticated && !token) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, token, router]);

  const loadTodos = async () => {
    setFetching(true);
    setError(null);

    if (!token) {
      setError('Missing authentication token.');
      setFetching(false);
      return;
    }

    try {
      const res = await fetch('/api/todos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(payload.error || 'Unable to load todos.');
      }
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load todos.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadTodos();
    }
  }, [token]);

  const filteredTodos = useMemo(() => {
    if (statusFilter === 'completed') {
      return todos.filter(todo => todo.completed);
    }
    if (statusFilter === 'active') {
      return todos.filter(todo => !todo.completed);
    }
    return todos;
  }, [statusFilter, todos]);

  const toggleCompletion = async (todo: Todo) => {
    if (!token) {
      toast('Missing authentication token.', 'error');
      return;
    }

    const updated = { ...todo, completed: !todo.completed };
    setTodos(prev => prev.map(item => (item.id === todo.id ? updated : item)));

    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: updated.completed }),
      });
      if (!res.ok) {
        throw new Error('Unable to update todo.');
      }
      toast('Todo updated.', 'success');
    } catch (err) {
      setTodos(prev => prev.map(item => (item.id === todo.id ? todo : item)));
      toast(err instanceof Error ? err.message : 'Unable to update todo.', 'error');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Your todos</h1>
          <p className="text-sm text-secondary">Manage tasks, deadlines, and progress at a glance.</p>
        </div>
        <Link
          href="/todos/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          Create todo
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Todo list</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="statusFilter" className="text-sm text-secondary">
                Filter
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value as 'all' | 'completed' | 'active')}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {fetching && (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          )}

          {!fetching && error && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-error">{error}</p>
              <Button variant="outline" onClick={loadTodos}>
                Try again
              </Button>
            </div>
          )}

          {!fetching && !error && filteredTodos.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-secondary">No todos match this filter.</p>
              <Link className="text-sm font-medium text-primary hover:underline" href="/todos/new">
                Create your first todo
              </Link>
            </div>
          )}

          {!fetching && !error && filteredTodos.length > 0 && (
            <ul className="space-y-4">
              {filteredTodos.map(todo => (
                <li
                  key={todo.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{todo.title}</h3>
                      <Badge variant={todo.completed ? 'success' : 'warning'}>
                        {todo.completed ? 'Completed' : 'In progress'}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary">
                      {todo.description || 'No description provided.'}
                    </p>
                    <p className="text-xs text-secondary">
                      Due: {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCompletion(todo)}
                      aria-label={todo.completed ? 'Mark todo as active' : 'Mark todo as completed'}
                    >
                      {todo.completed ? 'Mark active' : 'Mark complete'}
                    </Button>
                    <Link
                      href={`/todos/${todo.id}`}
                      className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                      View / Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

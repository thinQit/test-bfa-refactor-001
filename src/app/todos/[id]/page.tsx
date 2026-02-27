'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
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

export default function TodoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuth();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', completed: false });
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!loading && !isAuthenticated && !token) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, token, router]);

  const loadTodo = async () => {
    setFetching(true);
    setError(null);

    if (!token) {
      setError('Missing authentication token.');
      setFetching(false);
      return;
    }

    try {
      const res = await fetch(`/api/todos/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(payload.error || 'Unable to load todo.');
      }
      const data: Todo = await res.json();
      setTodo(data);
      setForm({
        title: data.title,
        description: data.description || '',
        due_date: data.due_date ? data.due_date.slice(0, 10) : '',
        completed: data.completed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load todo.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadTodo();
    }
  }, [token, params.id]);

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setError('Missing authentication token.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/todos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          due_date: form.due_date || null,
          completed: form.completed,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(payload.error || 'Unable to update todo.');
      }

      const updated: Todo = await res.json();
      setTodo(updated);
      toast('Todo updated.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update todo.');
      toast(err instanceof Error ? err.message : 'Unable to update todo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token) {
      setError('Missing authentication token.');
      return;
    }

    try {
      const res = await fetch(`/api/todos/${params.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(payload.error || 'Unable to delete todo.');
      }

      toast('Todo deleted.', 'success');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete todo.');
      toast(err instanceof Error ? err.message : 'Unable to delete todo.', 'error');
    } finally {
      setShowDelete(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Todo details</h1>
            <p className="text-sm text-secondary">Update the task or mark it complete.</p>
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
              <Button variant="outline" onClick={loadTodo}>
                Try again
              </Button>
            </div>
          )}

          {!fetching && !error && !todo && (
            <div className="py-6 text-center text-sm text-secondary">Todo not found.</div>
          )}

          {!fetching && !error && todo && (
            <form className="space-y-4" onSubmit={handleUpdate}>
              <Input
                label="Title"
                name="title"
                value={form.title}
                onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
                required
              />
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  id="description"
                  className="min-h-[120px] w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.description}
                  onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
                />
              </div>
              <Input
                label="Due date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={event => setForm(prev => ({ ...prev, due_date: event.target.value }))}
              />
              <div className="flex items-center gap-2">
                <input
                  id="completed"
                  type="checkbox"
                  checked={form.completed}
                  onChange={event => setForm(prev => ({ ...prev, completed: event.target.checked }))}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="completed" className="text-sm text-foreground">
                  Mark as completed
                </label>
              </div>
              {todo.created_at && (
                <p className="text-xs text-secondary">
                  Created: {todo.created_at ? new Date(todo.created_at).toLocaleDateString() : 'N/A'}
                </p>
              )}
              {error && <p className="text-sm text-error">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                  Back to dashboard
                </Button>
                <Button type="button" variant="destructive" onClick={() => setShowDelete(true)}>
                  Delete todo
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete todo?">
        <p className="text-sm text-secondary">This action cannot be undone.</p>
        <div className="mt-4 flex gap-3">
          <Button variant="destructive" onClick={handleDelete}>
            Confirm delete
          </Button>
          <Button variant="outline" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

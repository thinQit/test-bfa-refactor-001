'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useToast } from '@/providers/ToastProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function NewTodoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', due_date: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!loading && !isAuthenticated && !token) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, token, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    if (!token) {
      setError('Missing authentication token.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          due_date: form.due_date || undefined,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(payload.error || 'Unable to create todo.');
      }

      toast('Todo created.', 'success');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create todo.');
      toast(err instanceof Error ? err.message : 'Unable to create todo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Create a new todo</h1>
            <p className="text-sm text-secondary">Add details to help you remember what matters most.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              name="title"
              placeholder="Finish project report"
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
                placeholder="Optional notes about this task"
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
              helperText="Leave empty if there is no deadline."
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={saving} disabled={!form.title}>
                Save todo
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

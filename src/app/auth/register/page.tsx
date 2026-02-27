'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';

interface RegisterResponse {
  id: string;
  email: string;
  created_at: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await api.post<RegisterResponse>('/api/auth/register', {
      name: form.name || undefined,
      email: form.email,
      password: form.password,
    });

    if (error || !data) {
      setError(error || 'Unable to register.');
      toast(error || 'Unable to register.', 'error');
      setLoading(false);
      return;
    }

    toast('Account created! Please sign in.', 'success');
    setLoading(false);
    router.push('/auth/login');
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Create an account</h1>
            <p className="text-sm text-secondary">Start managing your todos in minutes.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={event => handleChange('name')(event.target.value)}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={event => handleChange('email')(event.target.value)}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Create a secure password"
              value={form.password}
              onChange={event => handleChange('password')(event.target.value)}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading} disabled={!form.email || !form.password}>
              Create account
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link className="font-medium text-primary hover:underline" href="/auth/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}

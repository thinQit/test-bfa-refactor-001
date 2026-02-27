'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';
import { useAuth } from '@/providers/AuthProvider';

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

interface ProfileResponse {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await api.post<LoginResponse>('/api/auth/login', {
      email: form.email,
      password: form.password,
    });

    if (error || !data) {
      setError(error || 'Invalid credentials.');
      toast(error || 'Invalid credentials.', 'error');
      setLoading(false);
      return;
    }

    localStorage.setItem('token', data.accessToken);

    try {
      const profileRes = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      });
      if (!profileRes.ok) {
        throw new Error('Unable to load profile');
      }
      const profile: ProfileResponse = await profileRes.json();
      login({
        id: profile.id,
        email: profile.email,
        name: profile.name || 'User',
        role: 'customer',
        createdAt: profile.created_at,
        updatedAt: profile.created_at,
      });
    } catch (err) {
      toast('Logged in, but failed to load profile.', 'warning');
    }

    toast('Welcome back!', 'success');
    setLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-secondary">Sign in to access your todos.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" fullWidth loading={loading} disabled={!form.email || !form.password}>
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-secondary">
        Need an account?{' '}
        <Link className="font-medium text-primary hover:underline" href="/auth/register">
          Register now
        </Link>
      </p>
    </div>
  );
}

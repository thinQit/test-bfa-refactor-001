'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/todos/new', label: 'New Todo' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-foreground" aria-label="Go to homepage">
          TodoApp
        </Link>
        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-sm font-medium text-foreground hover:text-primary">Login</Link>
              <Link href="/auth/register" className="text-sm font-medium text-foreground hover:text-primary">Sign up</Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={logout} aria-label="Logout">Logout</Button>
            </div>
          )}
        </div>
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md border border-border p-2"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="flex flex-col gap-1">
            <span className={cn('h-0.5 w-5 bg-foreground transition', open && 'translate-y-1.5 rotate-45')} />
            <span className={cn('h-0.5 w-5 bg-foreground transition', open && 'opacity-0')} />
            <span className={cn('h-0.5 w-5 bg-foreground transition', open && '-translate-y-1.5 -rotate-45')} />
          </div>
        </button>
      </div>
      {open && (
        <div className="border-t border-border px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-4">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link href="/auth/login" className="text-sm font-medium text-foreground hover:text-primary" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/auth/register" className="text-sm font-medium text-foreground hover:text-primary" onClick={() => setOpen(false)}>Sign up</Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">{user?.email}</span>
                <Button variant="outline" size="sm" onClick={logout} aria-label="Logout">Logout</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;

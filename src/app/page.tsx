import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="grid gap-6 rounded-lg border border-border bg-muted/40 p-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Organize your tasks with confidence</h1>
          <p className="text-secondary">
            Track your todos, stay on top of deadlines, and manage everything in one simple dashboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Create an account
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="space-y-2 px-4 py-5">
            <h2 className="text-lg font-semibold">Stay focused</h2>
            <p className="text-sm text-secondary">Keep all your tasks in a single, personalized list.</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2 px-4 py-5">
            <h2 className="text-lg font-semibold">Work at your pace</h2>
            <p className="text-sm text-secondary">Create, edit, and complete todos whenever it suits you.</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2 px-4 py-5">
            <h2 className="text-lg font-semibold">See what matters</h2>
            <p className="text-sm text-secondary">Quickly track what is done and what is next on your list.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}

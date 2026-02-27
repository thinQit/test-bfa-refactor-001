import Link from 'next/link';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-secondary">The page you are looking for does not exist.</p>
      <Link className="text-primary hover:underline" href="/">Go home</Link>
    </div>
  );
}

export default NotFound;

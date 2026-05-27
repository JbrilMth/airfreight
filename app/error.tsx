'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Captured by Next.js global error boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 mb-6">
        <AlertOctagon className="h-8 w-8" />
      </div>
      
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
        Something went wrong
      </h2>
      
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
        {error.message || 'An unexpected error occurred while communicating with the database or rendering the page.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => reset()} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" /> Try Again
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    </div>
  );
}

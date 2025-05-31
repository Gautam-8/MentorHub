import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-neutral-400 dark:text-neutral-500 animate-spin" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>
      </div>
    </div>
  );
} 
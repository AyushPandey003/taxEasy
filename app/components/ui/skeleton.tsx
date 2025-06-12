// src/components/ui/skeleton.tsx
export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
    return <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />;
  }
  
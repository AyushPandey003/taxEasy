import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils/util2";


export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300", className)} {...props} />
  );
}

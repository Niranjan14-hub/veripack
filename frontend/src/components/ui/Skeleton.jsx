import { cn } from '../../lib/format';

export function Skeleton({ className }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-white/[0.05]', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
    </div>
  );
}

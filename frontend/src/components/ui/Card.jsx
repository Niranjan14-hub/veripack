import { cn } from '../../lib/format';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('panel', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-line px-5 py-4',
        className,
      )}
    >
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

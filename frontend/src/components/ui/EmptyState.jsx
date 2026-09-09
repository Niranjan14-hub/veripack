import { cn } from '../../lib/format';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-16 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-line bg-elevated text-muted">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

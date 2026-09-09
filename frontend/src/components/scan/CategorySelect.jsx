import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../lib/format';
import { Skeleton } from '../ui/Skeleton';

export function CategorySelect({ categories, value, onChange, disabled }) {
  if (!categories.length) {
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-[4.5rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {categories.map((category) => {
        const active = category.key === value;
        return (
          <button
            key={category.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(category.key)}
            className={cn(
              'relative rounded-xl border p-4 text-left transition-all duration-200 focus-ring disabled:opacity-60',
              active
                ? 'border-accent/60 bg-accent-dim'
                : 'border-line bg-surface hover:border-line-strong hover:bg-elevated',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={cn('text-sm font-medium', active ? 'text-ink' : 'text-ink/90')}>
                {category.label}
              </span>
              {active ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent"
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </motion.span>
              ) : null}
            </div>
            <p className="mt-1 text-2xs leading-relaxed text-muted">
              {category.required_fields.length} required fields
            </p>
          </button>
        );
      })}
    </div>
  );
}

import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { FieldStatusBadge } from '../ui/Badge';
import { cn } from '../../lib/format';

export function FieldTable({ fields, activeField, onHover }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">Extracted fields</h3>
        <span className="text-2xs text-subtle">
          {fields.filter((field) => field.status === 'present').length}/{fields.length} clean
        </span>
      </div>

      <ul onMouseLeave={() => onHover(null)}>
        {fields.map((field, index) => (
          <motion.li
            key={field.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onMouseEnter={() => onHover(field.key)}
            className={cn(
              'grid cursor-default grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-4 py-3 transition-colors last:border-b-0',
              activeField === field.key ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]',
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-ink">{field.label}</p>
                {field.value && !field.grounded ? (
                  <span
                    title="This value was not found verbatim in the OCR text"
                    className="inline-flex items-center gap-1 rounded border border-warn/35 bg-warn-dim px-1 py-px text-[9px] font-medium uppercase tracking-wide text-warn"
                  >
                    <ShieldAlert className="h-2.5 w-2.5" />
                    ungrounded
                  </span>
                ) : null}
              </div>
              <p
                className={cn(
                  'mt-1 truncate text-xs',
                  field.value ? 'text-muted' : 'italic text-subtle',
                )}
                title={field.value ?? undefined}
              >
                {field.value ?? 'Not detected on the label'}
              </p>
            </div>
            <FieldStatusBadge status={field.status} required={field.required} />
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

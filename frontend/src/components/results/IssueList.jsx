import { motion } from 'framer-motion';
import { CheckCircle2, Wrench } from 'lucide-react';
import { SeverityBadge } from '../ui/Badge';
import { severityRank } from '../../lib/format';

export function IssueList({ issues, onHover }) {
  if (!issues.length) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-ok/30 bg-ok-dim px-5 py-5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-ok" />
        <div>
          <p className="text-sm font-semibold text-ink">No compliance issues</p>
          <p className="mt-0.5 text-xs text-muted">
            Every required declaration for this category was found and well-formed.
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...issues].sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">Issues to resolve</h3>
        <span className="text-2xs text-subtle">{issues.length} total</span>
      </div>
      <ul onMouseLeave={() => onHover?.(null)}>
        {sorted.map((issue, index) => (
          <motion.li
            key={`${issue.field}-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onMouseEnter={() => onHover?.(issue.field)}
            className="border-b border-line px-4 py-4 transition-colors last:border-b-0 hover:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-ink">{issue.label}</p>
              <SeverityBadge severity={issue.severity} />
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{issue.message}</p>
            <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-line bg-elevated px-3 py-2">
              <Wrench className="mt-0.5 h-3 w-3 shrink-0 text-accent-soft" />
              <p className="text-xs leading-relaxed text-ink/80">{issue.fix}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

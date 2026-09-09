import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { VerdictBadge } from '../ui/Badge';
import { mediaUrl } from '../../lib/api';
import { relativeTime } from '../../lib/format';

const scoreTone = (score) =>
  score >= 90 ? 'text-ok' : score >= 60 ? 'text-warn' : 'text-bad';

export function ScanCard({ scan, onDelete, index = 0 }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="group relative overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-line-strong"
    >
      <Link to={`/results/${scan.id}`} className="block focus-ring">
        <div className="relative h-36 overflow-hidden bg-black/40">
          {scan.image_url ? (
            <img
              src={mediaUrl(scan.image_url)}
              alt={scan.product_name ?? 'Scan'}
              className="h-full w-full object-cover object-top opacity-80 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
          <div className="absolute left-3 top-3">
            <VerdictBadge verdict={scan.verdict} />
          </div>
        </div>

        <div className="px-4 pb-4 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {scan.product_name ?? 'Unnamed product'}
              </p>
              <p className="mt-0.5 text-2xs text-subtle">
                {scan.category_label} · {relativeTime(scan.created_at)}
              </p>
            </div>
            <span className={`shrink-0 text-lg font-semibold tabular-nums ${scoreTone(scan.score)}`}>
              {scan.score}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-2xs text-muted">
              {scan.issue_count === 0
                ? 'No issues'
                : `${scan.issue_count} issue${scan.issue_count === 1 ? '' : 's'}`}
            </span>
            <span className="inline-flex items-center gap-1 text-2xs text-muted transition-colors group-hover:text-ink">
              View report
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label="Delete scan"
        onClick={() => onDelete(scan.id)}
        className="absolute right-3 top-3 rounded-lg border border-line-strong bg-canvas/80 p-1.5 text-muted opacity-0 backdrop-blur transition-all hover:text-bad focus-ring group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

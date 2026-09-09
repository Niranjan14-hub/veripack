import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScoreRing } from '../ui/ScoreRing';
import { Badge } from '../ui/Badge';
import { formatDate, totalMs } from '../../lib/format';
import { scaleIn } from '../../lib/motion';

export function VerdictHero({ scan, action }) {
  const verified = scan.verdict === 'verified';
  const Icon = verified ? CheckCircle2 : AlertTriangle;
  const critical = scan.issues.filter((issue) => issue.severity === 'critical').length;

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-line bg-surface"
    >
      <div
        className={`pointer-events-none absolute -left-24 -top-32 h-64 w-[32rem] rounded-full blur-[110px] ${
          verified ? 'bg-ok/20' : 'bg-bad/20'
        }`}
      />
      <div className="relative flex flex-col items-start gap-8 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-6">
          <ScoreRing score={scan.score} />
          <div>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
                verified ? 'border-ok/40 bg-ok-dim text-ok' : 'border-bad/40 bg-bad-dim text-bad'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.4} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {verified ? 'Verified' : 'Issues found'}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
              {scan.product_name ?? 'Unnamed product'}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge>{scan.category_label}</Badge>
              {scan.demo ? <Badge tone="accent">Sample</Badge> : null}
              <span className="text-2xs text-subtle">{formatDate(scan.created_at)}</span>
              <span className="text-2xs text-subtle">· {totalMs(scan.timings)} ms</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted">
              {verified
                ? 'Every required declaration for this category was found and well-formed.'
                : `${scan.issues.length} issue${scan.issues.length === 1 ? '' : 's'} detected${
                    critical ? `, ${critical} critical` : ''
                  }. Review the fixes below before printing.`}
            </p>
          </div>
        </div>
        {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
      </div>
    </motion.div>
  );
}

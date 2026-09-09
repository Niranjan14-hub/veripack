import { AlertTriangle, CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import { cn } from '../../lib/format';

const TONES = {
  neutral: 'border-line-strong bg-white/[0.04] text-muted',
  accent: 'border-accent/35 bg-accent-dim text-accent-soft',
  ok: 'border-ok/35 bg-ok-dim text-ok',
  warn: 'border-warn/35 bg-warn-dim text-warn',
  bad: 'border-bad/35 bg-bad-dim text-bad',
};

export function Badge({ tone = 'neutral', className, children, icon: Icon }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium tracking-wide',
        TONES[tone],
        className,
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={2.2} /> : null}
      {children}
    </span>
  );
}

export function VerdictBadge({ verdict, className }) {
  const verified = verdict === 'verified';
  return (
    <Badge
      tone={verified ? 'ok' : 'bad'}
      icon={verified ? CheckCircle2 : AlertTriangle}
      className={cn('uppercase', className)}
    >
      {verified ? 'Verified' : 'Issues found'}
    </Badge>
  );
}

const FIELD_STATUS = {
  present: { tone: 'ok', icon: CheckCircle2, label: 'Present' },
  missing: { tone: 'bad', icon: XCircle, label: 'Missing' },
  invalid: { tone: 'warn', icon: AlertTriangle, label: 'Invalid' },
};

export function FieldStatusBadge({ status, required }) {
  if (status === 'missing' && !required) {
    return (
      <Badge tone="neutral" icon={CircleDashed}>
        Optional
      </Badge>
    );
  }
  const config = FIELD_STATUS[status] ?? FIELD_STATUS.missing;
  return (
    <Badge tone={config.tone} icon={config.icon}>
      {config.label}
    </Badge>
  );
}

export function SeverityBadge({ severity }) {
  const tone = severity === 'critical' ? 'bad' : severity === 'major' ? 'warn' : 'neutral';
  return (
    <Badge tone={tone} className="uppercase">
      {severity}
    </Badge>
  );
}

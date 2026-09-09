export const cn = (...classes) => classes.filter(Boolean).join(' ');

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export const totalMs = (timings) =>
  timings
    ? timings.preprocess_ms + timings.ocr_ms + timings.structure_ms + timings.compliance_ms
    : 0;

export const verdictLabel = (verdict) => (verdict === 'verified' ? 'Verified' : 'Issues found');

export const severityRank = { critical: 0, major: 1, minor: 2 };

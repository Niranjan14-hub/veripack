import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn, totalMs } from '../../lib/format';

export function RawTextPanel({ scan }) {
  const [open, setOpen] = useState(false);

  const meta = [
    ['OCR confidence', `${Math.round(scan.ocr.confidence * 100)}%`],
    ['Words read', scan.ocr.word_count],
    ['Structurer', scan.structurer],
    ['Total time', `${totalMs(scan.timings)} ms`],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.03] focus-ring"
      >
        <div>
          <h3 className="text-sm font-semibold text-ink">Raw OCR output</h3>
          <p className="mt-0.5 text-2xs text-muted">
            The exact text the pipeline worked from — the audit trail behind every field.
          </p>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line"
          >
            <div className="grid grid-cols-2 gap-px border-b border-line bg-line sm:grid-cols-4">
              {meta.map(([label, value]) => (
                <div key={label} className="bg-surface px-4 py-3">
                  <p className="text-2xs uppercase tracking-wide text-subtle">{label}</p>
                  <p className="mt-0.5 text-xs font-medium text-ink">{value}</p>
                </div>
              ))}
            </div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap px-4 py-4 font-mono text-2xs leading-relaxed text-muted">
              {scan.ocr.text || 'No text was recovered from this image.'}
            </pre>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/format';

export const STAGES = [
  { key: 'upload', label: 'Uploading image' },
  { key: 'preprocess', label: 'Enhancing with OpenCV' },
  { key: 'ocr', label: 'Reading text with Tesseract' },
  { key: 'structure', label: 'Structuring fields with AI' },
  { key: 'compliance', label: 'Checking compliance rules' },
];

export function PipelineProgress({ activeIndex }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Analysing package</p>
        <span className="font-mono text-2xs text-subtle">
          {Math.min(activeIndex + 1, STAGES.length)}/{STAGES.length}
        </span>
      </div>
      <ol className="space-y-1">
        {STAGES.map((stage, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li
              key={stage.key}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                active && 'bg-white/[0.04]',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors',
                  done && 'border-ok/50 bg-ok-dim text-ok',
                  active && 'border-accent/60 bg-accent-dim text-accent-soft animate-pulse-ring',
                  !done && !active && 'border-line text-subtle',
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </motion.span>
                  ) : active ? (
                    <motion.span key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 className="h-3 w-3 animate-spin" strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <span key="idle" className="h-1 w-1 rounded-full bg-current" />
                  )}
                </AnimatePresence>
              </span>
              <span
                className={cn(
                  'text-sm transition-colors',
                  done ? 'text-muted' : active ? 'text-ink' : 'text-subtle',
                )}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: '4%' }}
          animate={{ width: `${((activeIndex + 1) / STAGES.length) * 100}%` }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
        />
      </div>
    </div>
  );
}

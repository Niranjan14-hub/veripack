import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { easeOut } from '../../lib/motion';

const ROWS = [
  { label: 'Product Name', value: 'Alpine Oat Granola', status: 'ok' },
  { label: 'Ingredient List', value: 'Rolled oats, cane sugar, sunflower oil…', status: 'ok' },
  { label: 'Allergen Declaration', value: 'Oats, Almonds', status: 'ok' },
  { label: 'Net Quantity', value: '12 oz', status: 'warn' },
  { label: 'Expiry / Best Before', value: 'Not detected', status: 'bad' },
  { label: 'Nutrition Information', value: 'Energy 1840 kJ, Fat 16 g…', status: 'ok' },
];

const ICONS = {
  ok: { Icon: CheckCircle2, className: 'text-ok' },
  warn: { Icon: AlertTriangle, className: 'text-warn' },
  bad: { Icon: XCircle, className: 'text-bad' },
};

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: easeOut }}
      style={{ perspective: 1200 }}
      className="relative mx-auto mt-16 w-full max-w-4xl"
    >
      <div className="absolute -inset-x-16 -top-10 -bottom-16 rounded-[3rem] bg-accent/20 blur-[100px]" />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-2 border-b border-line bg-elevated/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="ml-3 truncate font-mono text-2xs text-subtle">
            veripack.app/results/3f6703b2bfb9
          </span>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-bad/30 bg-bad-dim px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-bad" />
              <div>
                <p className="text-sm font-semibold text-ink">Issues found</p>
                <p className="text-xs text-muted">2 of 10 required fields need attention</p>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-xl border border-line bg-elevated p-4">
              <div className="space-y-2">
                <div className="h-2.5 w-2/3 rounded bg-white/10" />
                <div className="h-2 w-1/2 rounded bg-white/[0.07]" />
                <div className="mt-4 space-y-1.5">
                  {[9, 8, 7, 9, 6].map((width, index) => (
                    <div
                      key={index}
                      className="h-1.5 rounded bg-white/[0.06]"
                      style={{ width: `${width * 10}%` }}
                    />
                  ))}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, ease: easeOut }}
                className="absolute left-[14%] top-[58%] h-7 w-[42%] rounded-md border-2 border-warn/80 bg-warn/10"
              >
                <span className="absolute -top-5 left-0 rounded bg-warn px-1.5 py-0.5 text-[9px] font-semibold text-black">
                  net quantity
                </span>
              </motion.div>
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
                className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-accent/25 to-transparent"
              />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-elevated/50">
            {ROWS.map((row, index) => {
              const { Icon, className } = ICONS[row.status];
              return (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.08, ease: easeOut }}
                  className="flex items-center gap-3 border-b border-line px-4 py-[0.65rem] last:border-b-0"
                >
                  <Icon className={`h-4 w-4 shrink-0 ${className}`} strokeWidth={2.2} />
                  <span className="w-36 shrink-0 truncate text-xs text-muted">{row.label}</span>
                  <span className="truncate text-xs text-ink/90">{row.value}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

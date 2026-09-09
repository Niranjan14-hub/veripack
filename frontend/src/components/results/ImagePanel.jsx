import { AnimatePresence, motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { mediaUrl } from '../../lib/api';

const TONE = {
  present: 'border-ok bg-ok/10',
  invalid: 'border-warn bg-warn/10',
  missing: 'border-bad bg-bad/10',
};

const LABEL_TONE = {
  present: 'bg-ok text-black',
  invalid: 'bg-warn text-black',
  missing: 'bg-bad text-white',
};

export function ImagePanel({ scan, activeField }) {
  const boxed = scan.fields.filter((field) => field.bbox);
  const active = boxed.find((field) => field.key === activeField);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">Captured package</h3>
        <span className="inline-flex items-center gap-1.5 text-2xs text-subtle">
          <Crosshair className="h-3 w-3" />
          {boxed.length} regions located
        </span>
      </div>

      <div className="flex justify-center bg-black/40 p-3">
        <div className="relative w-fit">
          <img
            src={mediaUrl(scan.image_url)}
            alt="Scanned package"
            className="block max-h-[30rem] w-auto max-w-full"
          />
          <div className="pointer-events-none absolute inset-0">
            {boxed.map((field) => {
              const isActive = field.key === activeField;
              return (
                <motion.div
                  key={field.key}
                  initial={false}
                  animate={{ opacity: isActive ? 1 : activeField ? 0.12 : 0.4 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute rounded-[3px] border-2 ${TONE[field.status] ?? TONE.present}`}
                  style={{
                    left: `${field.bbox.x * 100}%`,
                    top: `${field.bbox.y * 100}%`,
                    width: `${field.bbox.width * 100}%`,
                    height: `${field.bbox.height * 100}%`,
                  }}
                />
              );
            })}
            <AnimatePresence>
              {active ? (
                <motion.span
                  key={active.key}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className={`absolute rounded px-1.5 py-0.5 text-[10px] font-semibold shadow-lg ${
                    LABEL_TONE[active.status] ?? LABEL_TONE.present
                  }`}
                  style={{
                    left: `${active.bbox.x * 100}%`,
                    top: `calc(${active.bbox.y * 100}% - 1.15rem)`,
                  }}
                >
                  {active.label}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="border-t border-line px-4 py-3 text-2xs text-subtle">
        Hover a field on the right to highlight where it was read from.
      </p>
    </div>
  );
}

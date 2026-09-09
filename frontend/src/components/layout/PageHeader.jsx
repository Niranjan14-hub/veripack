import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/motion';

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {eyebrow ? (
          <p className="mb-2 text-2xs font-medium uppercase tracking-[0.18em] text-accent-soft">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </motion.div>
  );
}

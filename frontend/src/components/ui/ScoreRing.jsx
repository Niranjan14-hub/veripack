import { motion } from 'framer-motion';
import { easeOut } from '../../lib/motion';

const toneFor = (score) => (score >= 90 ? '#30A46C' : score >= 60 ? '#F5A524' : '#E5484D');

export function ScoreRing({ score = 0, size = 132, stroke = 9, label = 'Compliance' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = toneFor(score);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 1.1, ease: easeOut }}
          style={{ filter: `drop-shadow(0 0 10px ${color}55)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: easeOut }}
          className="text-3xl font-semibold tabular-nums text-ink"
        >
          {score}
        </motion.span>
        <span className="text-2xs uppercase tracking-widest text-subtle">{label}</span>
      </div>
    </div>
  );
}

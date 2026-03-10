'use client';

import { motion } from 'framer-motion';

interface ScoreItem {
  label: string;
  score: number;
  maxScore: number;
}

interface Props {
  scores: ScoreItem[];
  overall: number;
}

function ScoreBar({ label, score, maxScore, delay }: ScoreItem & { delay: number }) {
  const pct = (score / maxScore) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-white/60 font-medium">{label}</span>
        <span className="text-white font-bold font-mono">
          {score}<span className="text-white/30">/{maxScore}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #61D1DC, #B4E9E9)' }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({ scores, overall }: Props) {
  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ background: '#0d0d0d', border: '1px solid #1e1e1e' }}>
      <div className="text-center pb-5" style={{ borderBottom: '1px solid #1e1e1e' }}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-semibold">
          Investor Readiness Score
        </p>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-7xl font-black rb-text-cyan"
        >
          {overall}
        </motion.div>
        <p className="text-white/20 text-xs mt-1 font-mono">/ 100</p>
      </div>
      <div className="space-y-4">
        {scores.map((s, i) => (
          <ScoreBar key={s.label} {...s} delay={i * 0.1 + 0.3} />
        ))}
      </div>
    </div>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  transcript: string;
  interimTranscript?: string;
  label?: string;
}

export function TranscriptDisplay({ transcript, interimTranscript, label = 'Transcript' }: Props) {
  const hasContent = transcript || interimTranscript;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {label && (
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">{label}</p>
      )}
      <div
        className="rounded-xl p-4 min-h-[100px] max-h-48 overflow-y-auto"
        style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}
      >
        <AnimatePresence mode="wait">
          {hasContent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="leading-relaxed text-sm"
            >
              <span className="text-white/80">{transcript}</span>
              {interimTranscript && (
                <span className="text-white/30 italic"> {interimTranscript}</span>
              )}
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="text-white/40 text-sm italic text-center mt-6"
            >
              Your words will appear here...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

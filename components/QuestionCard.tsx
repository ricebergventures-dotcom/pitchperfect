'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Volume2 } from 'lucide-react';

interface Props {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  isSpeaking: boolean;
}

export function QuestionCard({ question, questionNumber, totalQuestions, isSpeaking }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#61D1DC' }}>
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex-1 h-px rounded-full overflow-hidden" style={{ background: '#1e1e1e' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #61D1DC, #B4E9E9)' }}
          />
        </div>
        {isSpeaking && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: '#61D1DC' }}
          >
            <Volume2 className="w-3 h-3" />
            <span>Speaking</span>
          </motion.div>
        )}
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: '#0d0d0d',
          border: '1px solid #1e1e1e',
          borderLeft: '3px solid #61D1DC',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: '#61D1DC18', border: '1px solid #61D1DC40' }}
          >
            <MessageSquare className="w-4 h-4" style={{ color: '#61D1DC' }} />
          </div>
          <p className="text-white text-lg leading-relaxed font-medium">{question}</p>
        </div>
      </div>
    </motion.div>
  );
}

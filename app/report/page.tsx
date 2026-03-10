'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Download, RefreshCw } from 'lucide-react';
import { useSession } from '@/lib/session-context';
import { ScoreCard } from '@/components/ScoreCard';
import { ReportPreview } from '@/components/ReportPreview';

type Phase = 'analyzing' | 'sending' | 'done' | 'error';

function extractScores(report: string) {
  const extract = (pattern: string) => {
    const match = report.match(new RegExp(`${pattern}[^\\d]*(\\d+)\\s*/\\s*10`, 'i'));
    return match ? parseInt(match[1]) : 5;
  };
  const overallMatch = report.match(/overall[^\\d]*score[^\\d]*:?[^\\d]*(\d+)\s*\/\s*100/i);

  return {
    problemSolution: extract('clarity score|problem'),
    marketOpportunity: extract('market opportunity'),
    businessModel: extract('business model'),
    team: extract('team'),
    traction: extract('traction'),
    overall: overallMatch ? parseInt(overallMatch[1]) : 60,
  };
}

const PROGRESS_MESSAGES = [
  'Analyzing your pitch...',
  'Evaluating market opportunity...',
  'Assessing business model...',
  'Reviewing team & traction...',
  'Calculating investor readiness...',
  'Sending your report...',
];

export default function ReportPage() {
  const router = useRouter();
  const { state, dispatch } = useSession();
  const [phase, setPhase] = useState<Phase>('analyzing');
  const [progressMsg, setProgressMsg] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state.founderName) router.push('/');
  }, [state.founderName, router]);

  useEffect(() => {
    if (!state.pitchTranscript) return;
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'analyzing' && phase !== 'sending') return;
    const t = setInterval(
      () => setProgressMsg((p) => Math.min(p + 1, PROGRESS_MESSAGES.length - 1)),
      2500
    );
    return () => clearInterval(t);
  }, [phase]);

  const runAnalysis = async () => {
    try {
      const analysisRes = await fetch('/api/analyze-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchTranscript: state.pitchTranscript,
          companyName: state.companyName,
          category: state.category,
          qaSession: state.qaSession,
          deckSummary: state.deckSummary || undefined,
        }),
      });
      const { report } = await analysisRes.json();

      if (!report) throw new Error('Empty report from API');
      const scores = extractScores(report);
      dispatch({ type: 'SET_REPORT', payload: { report, scores } });

      // Email is best-effort — never block the report display
      setPhase('sending');
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            founderName: state.founderName,
            email: state.email,
            companyName: state.companyName,
            report,
            scores,
          }),
        });
      } catch (emailErr) {
        console.warn('Email failed (non-fatal):', emailErr);
      }

      setPhase('done');
    } catch (err) {
      console.error(err);
      setError('Could not generate your report. Please try again.');
      setPhase('error');
    }
  };

  const scores = [
    { label: 'Problem & Solution', score: state.scores.problemSolution, maxScore: 10 },
    { label: 'Market Opportunity', score: state.scores.marketOpportunity, maxScore: 10 },
    { label: 'Business Model', score: state.scores.businessModel, maxScore: 10 },
    { label: 'Team', score: state.scores.team, maxScore: 10 },
    { label: 'Traction', score: state.scores.traction, maxScore: 10 },
  ];

  return (
    <div className="min-h-screen px-4 py-8 relative overflow-hidden bg-black">
      {/* Subtle top glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-5"
          style={{ background: 'radial-gradient(ellipse, #61D1DC 0%, transparent 70%)' }}
        />
      </div>

      {/* Header bar */}
      <div
        className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4"
        style={{ background: '#242424', borderBottom: '1px solid #1e1e1e' }}
      >
        <span className="font-bold text-xs uppercase tracking-widest" style={{ color: '#61D1DC' }}>
          PitchPerfect
        </span>
        <span className="text-white/30 text-xs">Analysis Report</span>
      </div>

      <div className="max-w-2xl mx-auto relative z-10 pt-20">
        <AnimatePresence mode="wait">
          {/* Analyzing */}
          {(phase === 'analyzing' || phase === 'sending') && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8 mt-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-2 border-t-transparent mx-auto"
                style={{ borderColor: '#61D1DC', borderTopColor: 'transparent' }}
              />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Generating Your Report</h2>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={progressMsg}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm font-medium"
                    style={{ color: '#61D1DC' }}
                  >
                    {PROGRESS_MESSAGES[progressMsg]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex justify-center gap-2">
                {PROGRESS_MESSAGES.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: i <= progressMsg ? 1 : 0.2 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#61D1DC' }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Done */}
          {phase === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Success banner */}
              <div
                className="flex items-center gap-3 rounded-xl p-4"
                style={{ background: '#001a12', border: '1px solid #003d28' }}
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#61D1DC' }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#61D1DC' }}>Analysis Complete</p>
                  <p className="text-white/40 text-xs">Your report has been submitted for review</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h1 className="text-3xl font-black rb-text-gradient">{state.companyName}</h1>
                <p className="text-white/30 mt-1 text-xs uppercase tracking-widest">VC Investment Analysis</p>
              </div>

              {/* Scores */}
              <ScoreCard scores={scores} overall={state.scores.overall} />

              {/* Report */}
              {state.report && <ReportPreview report={state.report} />}

              {/* Actions */}
              <div className="flex gap-3 pb-8">
                <button
                  onClick={() => {
                    dispatch({ type: 'RESET' });
                    router.push('/');
                  }}
                  className="flex-1 py-3 rounded-xl font-semibold text-white/60 flex items-center justify-center gap-2 transition-colors text-sm hover:text-white"
                  style={{ background: '#111111', border: '1px solid #242424' }}
                >
                  <RefreshCw className="w-4 h-4" />
                  New Pitch
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([state.report], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${state.companyName}-pitch-analysis.md`;
                    a.click();
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 text-sm"
                  style={{ background: '#61D1DC' }}
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4 mt-20"
            >
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => { setPhase('analyzing'); setProgressMsg(0); runAnalysis(); }}
                className="px-6 py-3 rounded-xl font-bold text-black text-sm"
                style={{ background: '#61D1DC' }}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

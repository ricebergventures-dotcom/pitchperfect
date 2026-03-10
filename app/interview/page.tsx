'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, SkipForward } from 'lucide-react';
import { useSession } from '@/lib/session-context';
import { WaveformVisualizer } from '@/components/WaveformVisualizer';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { QuestionCard } from '@/components/QuestionCard';
import { createSpeechRecognition, speakText, stopSpeaking } from '@/lib/speech';

type Phase = 'waiting' | 'speaking' | 'countdown' | 'listening' | 'transitioning' | 'processing';

export default function InterviewPage() {
  const router = useRouter();
  const { state, dispatch } = useSession();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [countdown, setCountdown] = useState(3);
  const [answer, setAnswer] = useState('');
  const [interimAnswer, setInterimAnswer] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [manualAnswer, setManualAnswer] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const questionIndexRef = useRef(0);
  const startedRef = useRef(false); // prevent double-init

  useEffect(() => {
    if (!state.founderName) router.push('/');
  }, [state.founderName, router]);

  // Only fires once when questions first arrive
  useEffect(() => {
    if (state.questions.length > 0 && !startedRef.current) {
      startedRef.current = true;
      askQuestion(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.questions]);

  const askQuestion = (idx: number) => {
    questionIndexRef.current = idx;
    setQuestionIndex(idx);
    setAnswer('');
    setInterimAnswer('');
    setManualAnswer('');
    setPhase('speaking');
    setIsSpeaking(true);

    speakText(state.questions[idx], () => {
      setIsSpeaking(false);
      setPhase('countdown');
      setCountdown(3);
    });
  };

  const handleSkipSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setPhase('countdown');
    setCountdown(3);
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('listening');
      startListening();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, phase]);

  const startListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    const recognition = createSpeechRecognition();
    if (!recognition) { setSpeechSupported(false); return; }
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
        else interim += event.results[i][0].transcript;
      }
      if (final) setAnswer((prev) => prev + final);
      setInterimAnswer(interim);
    };

    recognition.onerror = (_event: SpeechRecognitionErrorEvent) => setSpeechSupported(false);

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch { /* already stopped */ }
      }
    };

    recognition.start();
  };

  const handleNextQuestion = () => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      rec.onend = null;
      try { rec.stop(); } catch { /* ignore */ }
    }
    stopSpeaking();

    const finalAnswer = answer + interimAnswer + manualAnswer;
    const currentIdx = questionIndexRef.current;

    dispatch({
      type: 'ADD_QA',
      payload: { question: state.questions[currentIdx], answer: finalAnswer },
    });

    const nextIdx = currentIdx + 1;
    if (nextIdx < state.questions.length) {
      // Use 'transitioning' — NOT 'waiting', so the init useEffect doesn't re-fire
      setPhase('transitioning');
      setTimeout(() => askQuestion(nextIdx), 500);
    } else {
      setPhase('processing');
      setTimeout(() => router.push('/report'), 500);
    }
  };

  const questions = state.questions;
  const currentQuestion = questions[questionIndex] || '';

  const showSpinner = phase === 'waiting' || phase === 'transitioning';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-5"
          style={{ background: 'radial-gradient(ellipse, #61D1DC 0%, transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4" style={{ background: '#242424', borderBottom: '1px solid #1e1e1e' }}>
        <div>
          <p className="font-bold text-xs uppercase tracking-widest" style={{ color: '#61D1DC' }}>VC Interview</p>
          <p className="text-white/40 text-xs">{state.companyName}</p>
        </div>
        {questions.length > 0 && (
          <p className="text-white/40 text-xs font-mono">{questionIndex + 1} / {questions.length}</p>
        )}
      </div>

      <div className="w-full max-w-2xl space-y-8 pt-16">
        <AnimatePresence mode="wait">
          {/* Waiting for questions / transitioning between questions */}
          {showSpinner && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-2 border-t-transparent mx-auto"
                style={{ borderColor: '#61D1DC', borderTopColor: 'transparent' }}
              />
              <p className="text-white/40 text-sm">
                {phase === 'waiting' ? 'Preparing your interview questions...' : 'Next question...'}
              </p>
            </motion.div>
          )}

          {/* AI speaks the question aloud */}
          {phase === 'speaking' && (
            <motion.div key="speaking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <QuestionCard
                question={currentQuestion}
                questionNumber={questionIndex + 1}
                totalQuestions={questions.length}
                isSpeaking={isSpeaking}
              />
              <div className="text-center">
                <button
                  onClick={handleSkipSpeaking}
                  className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 transition-colors"
                  style={{ border: '1px solid #1e1e1e' }}
                >
                  <SkipForward className="w-4 h-4" />
                  Skip — I&apos;m ready to answer
                </button>
              </div>
            </motion.div>
          )}

          {/* Countdown */}
          {phase === 'countdown' && (
            <motion.div key="countdown" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
              <QuestionCard
                question={currentQuestion}
                questionNumber={questionIndex + 1}
                totalQuestions={questions.length}
                isSpeaking={false}
              />
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-black rb-text-cyan mt-4"
              >
                {countdown === 0 ? 'Speak!' : countdown}
              </motion.div>
            </motion.div>
          )}

          {/* Listening */}
          {phase === 'listening' && (
            <motion.div key="listening" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <QuestionCard
                question={currentQuestion}
                questionNumber={questionIndex + 1}
                totalQuestions={questions.length}
                isSpeaking={false}
              />

              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #61D1DC18, #61D1DC08)', border: '2px solid #61D1DC', boxShadow: '0 0 30px rgba(97,209,220,0.15)' }}
                >
                  {speechSupported ? <Mic className="w-6 h-6" style={{ color: '#61D1DC' }} /> : <MicOff className="w-6 h-6 text-white/40" />}
                </motion.div>
                <WaveformVisualizer isActive={speechSupported} />
              </div>

              <TranscriptDisplay transcript={answer} interimTranscript={interimAnswer} label="Your Answer" />

              {!speechSupported && (
                <textarea
                  value={manualAnswer}
                  onChange={(e) => setManualAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none resize-none text-sm"
                  style={{ background: '#0d0d0d', border: '1px solid #242424' }}
                />
              )}

              <motion.button
                onClick={handleNextQuestion}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-bold text-black text-sm tracking-wide"
                style={{ background: '#61D1DC', boxShadow: '0 0 30px rgba(97,209,220,0.2)' }}
              >
                {questionIndex + 1 < questions.length ? 'Next Question →' : 'Finish Interview'}
              </motion.button>
            </motion.div>
          )}

          {/* Processing */}
          {phase === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-2 border-t-transparent mx-auto"
                style={{ borderColor: '#61D1DC', borderTopColor: 'transparent' }}
              />
              <p className="text-white/40 text-sm">Generating your analysis...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

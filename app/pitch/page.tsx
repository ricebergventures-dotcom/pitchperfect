'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, CheckCircle, AlertCircle } from 'lucide-react';
import { useSession } from '@/lib/session-context';
import { WaveformVisualizer } from '@/components/WaveformVisualizer';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { createSpeechRecognition } from '@/lib/speech';

export default function PitchPage() {
  const router = useRouter();
  const { state, dispatch } = useSession();
  const [phase, setPhase] = useState<'countdown' | 'listening' | 'done'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [manualInput, setManualInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!state.founderName) router.push('/');
  }, [state.founderName, router]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('listening');
      startRecognition();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, phase]);

  useEffect(() => {
    if (phase !== 'listening') return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startRecognition = () => {
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
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') setPermissionDenied(true);
      setSpeechSupported(false);
    };

    recognition.start();
  };

  const handleDonePitching = async () => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
    setPhase('done');

    const finalTranscript = transcript + interimTranscript + manualInput;
    dispatch({ type: 'SET_PITCH_TRANSCRIPT', payload: finalTranscript });

    fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pitchTranscript: finalTranscript,
        companyName: state.companyName,
        category: state.category,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        dispatch({ type: 'SET_QUESTIONS', payload: data.questions });
        router.push('/interview');
      })
      .catch(console.error);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-black">
      {/* Subtle cyan glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-5"
          style={{ background: 'radial-gradient(ellipse, #61D1DC 0%, transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4" style={{ background: '#242424', borderBottom: '1px solid #1e1e1e' }}>
        <div>
          <p className="font-bold text-sm tracking-wide" style={{ color: '#61D1DC' }}>{state.companyName}</p>
          <p className="text-white/40 text-xs">{state.founderName}</p>
        </div>
        {phase === 'listening' && (
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: '#1a0000', border: '1px solid #3d0000' }}>
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
            <span className="text-red-400 text-xs font-mono font-semibold">{formatTime(elapsed)}</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Countdown */}
        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-9xl font-black mb-4 rb-text-cyan"
            >
              {countdown === 0 ? 'Speak!' : countdown}
            </motion.div>
            <p className="text-white/40 text-lg font-medium">Get ready to pitch {state.companyName}</p>
          </motion.div>
        )}

        {/* Listening */}
        {phase === 'listening' && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl space-y-8 text-center"
          >
            {!speechSupported && (
              <div className="flex items-center gap-2 rounded-xl p-3 text-yellow-400 text-sm" style={{ background: '#1a1500', border: '1px solid #3d3000' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {permissionDenied
                  ? 'Microphone access denied. Use the text input below.'
                  : 'Speech recognition not supported. Use the text input below.'}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #61D1DC20, #61D1DC10)',
                  border: '2px solid #61D1DC',
                  boxShadow: '0 0 40px rgba(97,209,220,0.2)',
                }}
              >
                <Mic className="w-9 h-9" style={{ color: '#61D1DC' }} />
              </motion.div>
              <p className="text-xs font-semibold uppercase tracking-widest animate-pulse" style={{ color: '#61D1DC' }}>
                Listening...
              </p>
              <WaveformVisualizer isActive={speechSupported && !permissionDenied} />
            </div>

            <TranscriptDisplay transcript={transcript} interimTranscript={interimTranscript} />

            {(!speechSupported || permissionDenied) && (
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Type your pitch here..."
                rows={6}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none resize-none text-sm"
                style={{ background: '#0d0d0d', border: '1px solid #242424' }}
              />
            )}

            <motion.button
              onClick={handleDonePitching}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl font-bold text-black flex items-center gap-2 mx-auto text-sm tracking-wide"
              style={{ background: '#61D1DC', boxShadow: '0 0 30px rgba(97,209,220,0.2)' }}
            >
              <CheckCircle className="w-4 h-4" />
              Done Pitching
            </motion.button>
          </motion.div>
        )}

        {/* Processing */}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-2 border-t-transparent mx-auto"
              style={{ borderColor: '#61D1DC', borderTopColor: 'transparent' }}
            />
            <h2 className="text-2xl font-bold text-white">Processing your pitch...</h2>
            <p className="text-white/40">Generating intelligent follow-up questions</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

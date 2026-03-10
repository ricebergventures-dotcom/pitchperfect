'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowRight, Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useSession } from '@/lib/session-context';

const CATEGORIES = ['Life Science', 'Future of Compute', 'Climate Tech', 'Spacetech', 'Cybersecurity', 'Quantum', 'Other'];

type DeckStatus = 'idle' | 'processing' | 'done' | 'error';

export default function SetupPage() {
  const router = useRouter();
  const { dispatch } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ founderName: '', email: '', companyName: '', category: 'Life Science' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deckStatus, setDeckStatus] = useState<DeckStatus>('idle');
  const [deckFileName, setDeckFileName] = useState('');
  const [deckError, setDeckError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.founderName.trim()) newErrors.founderName = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Valid email is required';
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    return newErrors;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setDeckError('Only PDF and image files are supported.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setDeckError('File must be under 15MB.');
      return;
    }

    setDeckFileName(file.name);
    setDeckStatus('processing');
    setDeckError('');

    try {
      // Send raw file as FormData — no base64 overhead, no body size limit issues
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/process-deck', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) throw new Error('Processing failed');
      const { deckSummary } = await res.json();

      dispatch({ type: 'SET_DECK', payload: { deckSummary, deckFileName: file.name } });
      setDeckStatus('done');
    } catch {
      setDeckStatus('error');
      setDeckError('Failed to analyze deck. You can still proceed without it.');
    }
  };

  const removeDeck = () => {
    setDeckStatus('idle');
    setDeckFileName('');
    setDeckError('');
    dispatch({ type: 'SET_DECK', payload: { deckSummary: '', deckFileName: '' } });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    dispatch({ type: 'SET_USER_INFO', payload: form });
    router.push('/pitch');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #61D1DC 0%, transparent 70%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10 py-12"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 border border-[#61D1DC]/30"
            style={{ background: 'linear-gradient(135deg, #61D1DC18, #61D1DC08)' }}
          >
            <Mic className="w-9 h-9" style={{ color: '#61D1DC' }} />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight rb-text-gradient">PitchPerfect</h1>
          <p className="text-white/40 mt-2 text-sm font-medium tracking-wide uppercase">
            AI-Powered Pitch Analyzer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info fields */}
          <div className="rounded-2xl p-6 space-y-4" style={{ background: '#0d0d0d', border: '1px solid #1e1e1e' }}>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Your Name</label>
              <input
                type="text"
                value={form.founderName}
                onChange={(e) => setForm({ ...form, founderName: e.target.value })}
                placeholder="Alex Johnson"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition text-sm"
                style={{ background: '#0a0a0a', border: errors.founderName ? '1px solid #ef4444' : '1px solid #242424' }}
                onFocus={(e) => (e.target.style.borderColor = '#61D1DC')}
                onBlur={(e) => (e.target.style.borderColor = errors.founderName ? '#ef4444' : '#242424')}
              />
              {errors.founderName && <p className="text-red-400 text-xs mt-1.5">{errors.founderName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alex@startup.com"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition text-sm"
                style={{ background: '#0a0a0a', border: errors.email ? '1px solid #ef4444' : '1px solid #242424' }}
                onFocus={(e) => (e.target.style.borderColor = '#61D1DC')}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? '#ef4444' : '#242424')}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Acme Inc."
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition text-sm"
                style={{ background: '#0a0a0a', border: errors.companyName ? '1px solid #ef4444' : '1px solid #242424' }}
                onFocus={(e) => (e.target.style.borderColor = '#61D1DC')}
                onBlur={(e) => (e.target.style.borderColor = errors.companyName ? '#ef4444' : '#242424')}
              />
              {errors.companyName && <p className="text-red-400 text-xs mt-1.5">{errors.companyName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Sector</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className="py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center"
                    style={
                      form.category === cat
                        ? { background: '#61D1DC', color: '#000000', border: '1px solid #61D1DC' }
                        : { background: '#0a0a0a', color: 'rgba(255,255,255,0.4)', border: '1px solid #242424' }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pitch Deck Upload */}
          <div className="rounded-2xl p-5" style={{ background: '#0d0d0d', border: '1px solid #1e1e1e' }}>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              Pitch Deck <span className="text-white/20 normal-case tracking-normal font-normal">(optional — PDF or image)</span>
            </label>

            <AnimatePresence mode="wait">
              {/* Idle — show upload zone */}
              {deckStatus === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    id="deck-upload"
                  />
                  <label
                    htmlFor="deck-upload"
                    className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl cursor-pointer transition-colors"
                    style={{ border: '1px dashed #2e2e2e' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#61D1DC')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#2e2e2e')}
                  >
                    <Upload className="w-6 h-6 text-white/30" />
                    <span className="text-white/40 text-sm">Click to upload your pitch deck</span>
                    <span className="text-white/20 text-xs">PDF, PNG, JPG up to 15MB</span>
                  </label>
                  {deckError && <p className="text-red-400 text-xs mt-2">{deckError}</p>}
                </motion.div>
              )}

              {/* Processing */}
              {deckStatus === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 py-4 px-3 rounded-xl"
                  style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}
                >
                  <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: '#61D1DC' }} />
                  <div>
                    <p className="text-white text-sm font-medium truncate max-w-[240px]">{deckFileName}</p>
                    <p className="text-white/40 text-xs mt-0.5">Gemini is analyzing your deck...</p>
                  </div>
                </motion.div>
              )}

              {/* Done */}
              {deckStatus === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 py-4 px-3 rounded-xl"
                  style={{ background: '#001a12', border: '1px solid #003d28' }}
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#61D1DC' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{deckFileName}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#61D1DC' }}>Deck analyzed — questions will be tailored to your deck</p>
                  </div>
                  <button type="button" onClick={removeDeck} className="text-white/30 hover:text-white/60 flex-shrink-0 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Error */}
              {deckStatus === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 py-4 px-3 rounded-xl"
                  style={{ background: '#1a0000', border: '1px solid #3d0000' }}
                >
                  <FileText className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-400 text-sm">{deckError || 'Analysis failed'}</p>
                  </div>
                  <button type="button" onClick={removeDeck} className="text-white/30 hover:text-white/60 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={deckStatus === 'processing'}
            className="w-full py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-opacity text-sm tracking-wide disabled:opacity-50"
            style={{ background: '#61D1DC', boxShadow: '0 0 30px rgba(97,209,220,0.25)' }}
          >
            <Mic className="w-4 h-4" />
            Start Your Pitch
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6 tracking-wide">
          Best experience in Chrome or Edge — requires microphone access
        </p>
      </motion.div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic, ArrowRight } from 'lucide-react';
import { useSession } from '@/lib/session-context';

const CATEGORIES = ['SaaS', 'Consumer', 'Deeptech', 'Marketplace', 'Other'];

export default function SetupPage() {
  const router = useRouter();
  const { dispatch } = useSession();
  const [form, setForm] = useState({
    founderName: '',
    email: '',
    companyName: '',
    category: 'SaaS',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.founderName.trim()) newErrors.founderName = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Valid email is required';
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    dispatch({ type: 'SET_USER_INFO', payload: form });
    router.push('/pitch');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-black">
      {/* Subtle radial glow */}
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
        className="w-full max-w-md relative z-10"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div
            className="backdrop-blur-sm rounded-2xl p-6 space-y-4"
            style={{ background: '#0d0d0d', border: '1px solid #1e1e1e' }}
          >
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={form.founderName}
                onChange={(e) => setForm({ ...form, founderName: e.target.value })}
                placeholder="Alex Johnson"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition text-sm"
                style={{
                  background: '#0a0a0a',
                  border: errors.founderName ? '1px solid #ef4444' : '1px solid #242424',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#61D1DC')}
                onBlur={(e) => (e.target.style.borderColor = errors.founderName ? '#ef4444' : '#242424')}
              />
              {errors.founderName && (
                <p className="text-red-400 text-xs mt-1.5">{errors.founderName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alex@startup.com"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition text-sm"
                style={{
                  background: '#0a0a0a',
                  border: errors.email ? '1px solid #ef4444' : '1px solid #242424',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#61D1DC')}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? '#ef4444' : '#242424')}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Acme Inc."
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition text-sm"
                style={{
                  background: '#0a0a0a',
                  border: errors.companyName ? '1px solid #ef4444' : '1px solid #242424',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#61D1DC')}
                onBlur={(e) => (e.target.style.borderColor = errors.companyName ? '#ef4444' : '#242424')}
              />
              {errors.companyName && (
                <p className="text-red-400 text-xs mt-1.5">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                Pitch Category
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className="py-2 px-1 rounded-lg text-xs font-semibold transition-all"
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

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-shadow text-sm tracking-wide"
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

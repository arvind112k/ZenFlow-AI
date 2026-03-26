import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Clock, Target, Zap, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { generateMeditationSession } from '../services/gemini';

const GOALS = [
  { id: 'stress', label: 'Stress Relief', icon: Sparkles, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'focus', label: 'Deep Focus', icon: Zap, color: 'bg-amber-50 text-amber-600' },
  { id: 'sleep', label: 'Better Sleep', icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { id: 'anxiety', label: 'Reduce Anxiety', icon: Target, color: 'bg-rose-50 text-rose-600' }
];

const DURATIONS = [5, 10, 15, 30];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function SessionFlow() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(10);
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const session = await generateMeditationSession({ goal, duration, level });
      navigate('/session/play', { state: { session } });
    } catch (error) {
      console.error(error);
      alert('Failed to generate session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 flex items-center justify-between bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900">ZenFlow AI</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          ))}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">What is your goal today?</h2>
                  <p className="text-slate-500">We'll tailor the meditation to your specific needs.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => { setGoal(g.id); setStep(2); }}
                      className={`p-6 rounded-3xl border-2 transition-all text-left group ${goal === g.id ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-50' : 'border-transparent bg-white hover:border-slate-200'}`}
                    >
                      <div className={`w-12 h-12 ${g.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <g.icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-900 block">{g.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">How much time do you have?</h2>
                  <p className="text-slate-500">Every minute counts towards your mindfulness.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => { setDuration(d); setStep(3); }}
                      className={`p-8 rounded-3xl border-2 transition-all text-center ${duration === d ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-50' : 'border-transparent bg-white hover:border-slate-200'}`}
                    >
                      <span className="text-4xl font-black text-slate-900 block mb-1">{d}</span>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Minutes</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors mx-auto">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">What is your experience?</h2>
                  <p className="text-slate-500">We'll adjust the complexity of the yoga poses.</p>
                </div>
                <div className="space-y-4">
                  {LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between ${level === l ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-50' : 'border-transparent bg-white hover:border-slate-200'}`}
                    >
                      <span className="font-bold text-slate-900 capitalize text-lg">{l}</span>
                      {level === l && <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"><ArrowRight className="w-4 h-4 text-white" /></div>}
                    </button>
                  ))}
                </div>
                <div className="pt-8 flex flex-col gap-4">
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Generating Your Session...
                      </>
                    ) : (
                      <>
                        Generate Session
                        <Sparkles className="w-6 h-6" />
                      </>
                    )}
                  </button>
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors mx-auto">
                    <ArrowLeft className="w-5 h-5" /> Back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

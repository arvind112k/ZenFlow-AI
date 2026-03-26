import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, X, Volume2, VolumeX, ChevronRight, Sparkles } from 'lucide-react';
import { formatTime } from '../lib/utils';
import YogaPose from './YogaPose';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment, getDoc } from 'firebase/firestore';

export default function SessionPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);

  if (!session) {
    return <div className="p-8 text-center">No session found. <button onClick={() => navigate('/session/new')}>Start over</button></div>;
  }

  const totalDuration = session.script[session.script.length - 1].timestamp + 30; // buffer

  useEffect(() => {
    if (isPlaying && currentTime < totalDuration) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTime, totalDuration]);

  // Handle Step Changes and TTS
  useEffect(() => {
    const step = session.script.find((s: any, i: number) => {
      const nextStep = session.script[i + 1];
      return currentTime >= s.timestamp && (!nextStep || currentTime < nextStep.timestamp);
    });

    if (step) {
      const index = session.script.indexOf(step);
      if (index !== currentStepIndex) {
        setCurrentStepIndex(index);
        if (!isMuted) {
          speak(step.text);
        }
      }
    }

    if (currentTime >= totalDuration && !isFinished) {
      handleFinish();
    }
  }, [currentTime, session.script, currentStepIndex, isMuted, isFinished]);

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    synthRef.current.speak(utterance);
  };

  const handleFinish = async () => {
    setIsFinished(true);
    setIsPlaying(false);
    
    // Save progress
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'sessions'), {
          userId: auth.currentUser.uid,
          goal: session.title,
          duration: Math.floor(totalDuration / 60),
          completedAt: new Date(),
          title: session.title
        });

        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          totalMinutes: increment(Math.floor(totalDuration / 60)),
          lastSessionAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error saving session:", err);
      }
    }
  };

  const currentStep = session.script[currentStepIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-6 flex items-center justify-between z-10">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-400" />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-slate-900">{session.title}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {currentStepIndex + 1} of {session.script.length} Steps
          </p>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          {isMuted ? <VolumeX className="w-6 h-6 text-slate-400" /> : <Volume2 className="w-6 h-6 text-indigo-600" />}
        </button>
      </header>

      {/* Main Player Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center px-6">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${(currentTime / totalDuration) * 100}%` }}
          />
        </div>

        {/* Animation Figure */}
        <div className="w-full max-w-md aspect-square flex items-center justify-center mb-12">
          <YogaPose pose={currentStep?.pose || 'breathing'} isPlaying={isPlaying} />
        </div>

        {/* Instructions */}
        <div className="text-center max-w-xl mb-12 min-h-[100px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed"
            >
              {currentStep?.text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Timer */}
        <div className="text-5xl font-black text-slate-900 mb-12 tabular-nums">
          {formatTime(currentTime)}
        </div>
      </main>

      {/* Controls */}
      <footer className="p-12 flex items-center justify-center gap-8 bg-slate-50/50">
        <button 
          onClick={() => setCurrentTime(0)}
          className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white ml-1" />}
        </button>

        <button 
          onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 15))}
          className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </footer>

      {/* Finish Overlay */}
      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-xl z-50 flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">Session Complete</h2>
              <p className="text-slate-600 mb-12 leading-relaxed">
                You've taken a beautiful step towards mindfulness today. 
                Your progress has been saved.
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HandTracker } from '@/lib/handtracking/HandTracker';
import { extractAllDual } from '@/lib/handtracking/FeatureExtractor';
import { useWordPractice } from '@/hooks/useWordPractice';
import SignPracticePanel from '@/components/SignPracticePanel';
import ProgressTracker from '@/components/ProgressTracker';
import { Layers, Trophy, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { type SignSystem, SIGN_SYSTEMS } from '@/data/signSystems';
import { getSignImage, PLACEHOLDER_IMAGE } from '@/data/alphabet';

type PracticeMode = 'Easy' | 'Medium' | 'Hard';

const MODE_WORDS: Record<PracticeMode, string[]> = {
  Easy: ['ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  Medium: ['MOTIONWORDS'],
  Hard: ['IMPLEMENTASI', 'RESTRUKTURISASI', 'DEKONSTRUKSI', 'METAMORFOSIS']
};

const POPUP_TEXTS: Record<PracticeMode, string> = {
  Easy: "Your success shows that you have improved from before. You have successfully completed this challenge. Congratulations!",
  Medium: "Moving from easy to difficult always brings challenges, and the fact that you made it through means your ability has significantly improved.",
  Hard: "Keep going! Every challenge you overcome is a level up for your true potential."
};

const APPRECIATION_WORDS: Record<PracticeMode, string> = {
  Easy: "CONGRATS",
  Medium: "AWESOME",
  Hard: "BRILLIANT"
};

function AppreciationPopup({ mode, system, onClose }: {
  mode: PracticeMode; system: SignSystem; onClose: () => void;
}) {
  const signWord = APPRECIATION_WORDS[mode];
  const [signIndex, setSignIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSignIndex(p => (p + 1) % signWord.length), 600);
    return () => clearInterval(t);
  }, [signWord.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-4">{mode} Mode Completed!</h2>
        <p className="text-slate-600 text-center leading-relaxed mb-8">{POPUP_TEXTS[mode]}</p>
        <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Appreciation</p>
          <div className="w-32 h-32 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 p-2">
            <img
              src={getSignImage(system, signWord[signIndex])}
              alt={signWord[signIndex]}
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
            />
          </div>
          <div className="flex gap-1 justify-center flex-wrap">
            {signWord.split('').map((char, i) => (
              <span key={i} className={`text-lg font-bold transition-colors duration-300 ${i === signIndex ? 'text-brand-600 scale-110 transform' : 'text-slate-300'}`}>
                {char}
              </span>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="btn btn-primary w-full mt-8">Continue Practice</button>
      </motion.div>
    </div>
  );
}

export default function Practice() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeSystem, setActiveSystem] = useState<SignSystem>('bisindo');
  const [activeMode, setActiveMode] = useState<PracticeMode>('Easy');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const wordsQueue = MODE_WORDS[activeMode];
  const activeWord = wordsQueue[currentWordIndex] || wordsQueue[0];

  const {
    currentIndex, currentLetter, result, attempts,
    completed, processFeatures, reset, skip, isFinished
  } = useWordPractice(activeWord, activeSystem);

  const processFeaturesRef = useRef(processFeatures);
  useEffect(() => { processFeaturesRef.current = processFeatures; }, [processFeatures]);

  const resultRef = useRef(result);
  useEffect(() => { resultRef.current = result; }, [result]);

  // Ref untuk sign system — bisa dibaca di dalam closure tanpa restart tracker
  const activeSystemRef = useRef(activeSystem);
  useEffect(() => { activeSystemRef.current = activeSystem; }, [activeSystem]);

  const handleModeChange = (mode: PracticeMode) => {
    setActiveMode(mode);
    setCurrentWordIndex(0);
    setShowPopup(false);
  };

  useEffect(() => {
    if (isFinished) {
      if (currentWordIndex < wordsQueue.length - 1) {
        const t = setTimeout(() => setCurrentWordIndex(p => p + 1), 1000);
        return () => clearTimeout(t);
      } else {
        setShowPopup(true);
      }
    }
  }, [isFinished, currentWordIndex, wordsQueue.length]);

  // Initialize HandTracker ONCE — jangan restart saat system/mode berubah
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const tracker = new HandTracker(videoRef.current);

    // Callback sekarang terima DUA tangan
    tracker.onResults((primary, secondary) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (primary) {
        // Gambar dot overlay untuk kedua tangan
        const drawHand = (lms: typeof primary, color: string) => {
          ctx.fillStyle = color;
          lms.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, 2 * Math.PI);
            ctx.fill();
          });
        };

        const dotColor = resultRef.current === 'Correct' ? '#10b981' : '#ef4444';
        drawHand(primary, dotColor);
        if (secondary) drawHand(secondary, dotColor);

        // extractAllDual — 84 fitur untuk BISINDO, fallback 42 untuk sistem lain
        try {
          const isBisindo = activeSystemRef.current === 'bisindo';
          const { features, vector } = isBisindo
            ? extractAllDual(primary, secondary)   // 84 fitur
            : extractAllDual(primary, null);        // 42 fitur (h1 = zeros)

          processFeaturesRef.current({ features, vector });
        } catch {
          processFeaturesRef.current(null);
        }
      } else {
        processFeaturesRef.current(null);
      }
    });

    tracker.start();
    return () => tracker.stop();
  }, []); // kosong — tracker tidak restart

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen pb-20">
      {showPopup && (
        <AppreciationPopup
          mode={activeMode}
          system={activeSystem}
          onClose={() => handleModeChange(activeMode)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="mb-8 anim-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="eyebrow"><Layers className="w-3 h-3" />Level 04</span>
          </div>
          <h1 className="section-title mb-2">Sign Practice</h1>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
            Spell out words letter by letter. Hold each gesture steady for 1 second to confirm.
          </p>
        </div>

        <div className="card p-5 mb-8 flex flex-col gap-6 anim-fade-up delay-1">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1. Select Sign System</p>
            <div className="flex flex-wrap gap-2">
              {SIGN_SYSTEMS.map(sys => (
                <button
                  key={sys.key}
                  onClick={() => !sys.disabled && setActiveSystem(sys.key)}
                  disabled={sys.disabled}
                  title={sys.disabled ? sys.disabledReason : undefined}
                  className={`
      relative px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 select-none
      ${sys.disabled
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-60'
                      : activeSystem === sys.key
                        ? `${sys.color} text-white border-transparent shadow-md scale-[1.02]`
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-300'
                    }
    `}
                >
                  {sys.name}
                  {sys.disabled && (
                    <span className="ml-1.5 text-[10px] font-bold bg-slate-200 text-slate-400 px-1.5 py-0.5 rounded-full align-middle">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-slate-100" />

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">2. Select Difficulty</p>
            <div className="flex flex-wrap gap-3">
              {(['Easy', 'Medium', 'Hard'] as PracticeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${activeMode === m
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  {m} Mode
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 anim-fade-up delay-2">
            <div className="card p-2 relative">
              <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-bold tracking-wider uppercase">
                {activeSystem} Tracking Active
              </div>
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" playsInline muted />
                <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex justify-between items-end mb-4">
                <p className="section-over">Word Progress</p>
                <p className="text-sm font-bold text-slate-400">{currentWordIndex + 1} / {wordsQueue.length}</p>
              </div>
              <ProgressTracker word={activeWord} currentIndex={currentIndex} completed={completed} />
            </div>
          </div>

          <div className="anim-fade-up delay-3">
            <SignPracticePanel
              word={activeWord}
              currentLetter={currentLetter}
              result={result}
              attempts={attempts}
              isFinished={isFinished}
              system={activeSystem}
              onReset={reset}
              onSkip={skip}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

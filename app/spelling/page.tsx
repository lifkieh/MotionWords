'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Search, X } from 'lucide-react';
import { cn } from '../components/Navbar';
import { useTranslation } from '../components/LanguageContext';
import { alphabetData, PLACEHOLDER_IMAGE } from '@/data/alphabet';
import { type SignSystem, SIGN_SYSTEM_MAP } from '@/data/signSystems';
import SystemToggle from '@/components/SystemToggle';
import ComparisonPanel from '@/components/ComparisonPanel';
import SignPlayer from '@/components/SignPlayer';
import SpeedControl from '@/components/SpeedControl';

export default function SpellingTutor() {
  const { t } = useTranslation();
  const [activeSystems, setActiveSystems] = useState<SignSystem[]>(['bisindo']);
  const [word, setWord] = useState('');
  const [translatedWord, setTranslatedWord] = useState('');
  const [viewMode, setViewMode] = useState<'sequence' | 'stopmotion'>('sequence');
  const [speed, setSpeed] = useState(800);
  const [stopMotionIndex, setStopMotionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = word.trim().toUpperCase().replace(/[^A-Z\s]/g, '');
    setTranslatedWord(cleaned);
    setStopMotionIndex(0);
    setIsPlaying(true);
  };

  const chars = translatedWord.split('').filter((c) => c !== ' ');
  const isComparing = activeSystems.length >= 2;

  // Stop motion: advance frame callback
  const handleStopMotionComplete = useCallback(() => {
    setStopMotionIndex((prev) => {
      if (prev < chars.length - 1) return prev + 1;
      setIsPlaying(false);
      return prev;
    });
  }, [chars.length]);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {t('spelling.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          {t('spelling.subtitle')}
        </p>
      </div>

      {/* System Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <SystemToggle activeSystems={activeSystems} onChange={setActiveSystems} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-2xl inline-flex self-start">
            <button
              onClick={() => setViewMode('sequence')}
              className={cn(
                'px-5 py-2.5 rounded-xl font-medium text-sm transition-all',
                viewMode === 'sequence'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {t('spelling.sequence')}
            </button>
            <button
              onClick={() => setViewMode('stopmotion')}
              className={cn(
                'px-5 py-2.5 rounded-xl font-medium text-sm transition-all',
                viewMode === 'stopmotion'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {t('spelling.stopMotion')}
            </button>
          </div>

          <form onSubmit={handleTranslate} className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder={t('spelling.placeholder')}
                className="block w-full pl-11 pr-10 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
              {word && (
                <button
                  type="button"
                  onClick={() => { setWord(''); setTranslatedWord(''); }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!word.trim()}
              className="px-8 py-3 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              {t('spelling.translate')}
            </button>
          </form>
        </div>

        {/* Speed Control for Stop Motion */}
        {viewMode === 'stopmotion' && translatedWord && (
          <div className="mb-6 max-w-sm">
            <SpeedControl speed={speed} onChange={setSpeed} />
          </div>
        )}

        {/* Translation Result */}
        <div className="min-h-[300px] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center">
          {translatedWord ? (
            <div className="w-full">
              <h3 className="text-center text-2xl font-bold mb-8 text-slate-700 dark:text-slate-300">
                &ldquo;{translatedWord}&rdquo;
              </h3>

              {viewMode === 'sequence' ? (
                /* SEQUENCE MODE */
                isComparing ? (
                  /* Comparison sequence */
                  <div className="space-y-8">
                    {translatedWord.split('').map((char, index) => {
                      if (char === ' ') return <div key={`space-${index}`} className="w-full h-4" />;
                      return (
                        <motion.div
                          key={`${char}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="text-center mb-3">
                            <span className="text-3xl font-black text-slate-800 dark:text-slate-200">{char}</span>
                          </div>
                          <ComparisonPanel
                            activeSystems={activeSystems}
                            currentLetter={char}
                            renderPanel={(system) => {
                              const frames = alphabetData[char]?.[system] ?? [];
                              const src = frames[0] ?? PLACEHOLDER_IMAGE;
                              return (
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                                  <img
                                    src={src}
                                    alt={`${char} in ${system}`}
                                    className="w-full h-full object-contain p-1"
                                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                                  />
                                </div>
                              );
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* Single system sequence */
                  <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                    <AnimatePresence>
                      {translatedWord.split('').map((char, index) => {
                        if (char === ' ') return <div key={`space-${index}`} className="w-8" />;
                        const frames = alphabetData[char]?.[activeSystems[0]] ?? [];
                        const src = frames[0] ?? PLACEHOLDER_IMAGE;
                        const meta = SIGN_SYSTEM_MAP[activeSystems[0]];
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={`${char}-${index}`}
                            className="flex flex-col items-center gap-3"
                          >
                            <div className={cn(
                              "w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2 overflow-hidden",
                              `${meta.bgLight} ${meta.borderColor} ${meta.bgDark}`
                            )}>
                              <img
                                src={src}
                                alt={`${char} in ${activeSystems[0]}`}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                              />
                            </div>
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                              {char}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )
              ) : (
                /* STOP MOTION MODE */
                <div className="flex flex-col items-center">
                  {/* Letter progress */}
                  <div className="text-xl font-bold mb-6 tracking-widest text-slate-400 flex flex-wrap justify-center">
                    {chars.map((char, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "mx-1 transition-all duration-200",
                          idx === stopMotionIndex
                            ? "text-brand-500 dark:text-brand-400 scale-125"
                            : idx < stopMotionIndex
                              ? "text-slate-600 dark:text-slate-300"
                              : ""
                        )}
                      >
                        {char}
                      </span>
                    ))}
                  </div>

                  {/* Stop motion player(s) */}
                  {chars.length > 0 && stopMotionIndex < chars.length && (
                    isComparing ? (
                      <ComparisonPanel
                        activeSystems={activeSystems}
                        currentLetter={chars[stopMotionIndex]}
                        renderPanel={(system) => {
                          const frames = alphabetData[chars[stopMotionIndex]]?.[system] ?? [];
                          return (
                            <SignPlayer
                              frames={frames.length > 0 ? frames : [PLACEHOLDER_IMAGE]}
                              speed={speed}
                              autoPlay={isPlaying}
                              onComplete={handleStopMotionComplete}
                              showControls={false}
                              label={chars[stopMotionIndex]}
                            />
                          );
                        }}
                      />
                    ) : (
                      <SignPlayer
                        frames={(alphabetData[chars[stopMotionIndex]]?.[activeSystems[0]] ?? []).length > 0
                          ? alphabetData[chars[stopMotionIndex]][activeSystems[0]]
                          : [PLACEHOLDER_IMAGE]
                        }
                        speed={speed}
                        autoPlay={isPlaying}
                        onComplete={handleStopMotionComplete}
                        label={chars[stopMotionIndex]}
                      />
                    )
                  )}

                  {/* Manual controls */}
                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={() => { setStopMotionIndex(0); setIsPlaying(true); }}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors"
                    >
                      {t('common.reset')}
                    </button>
                    <button
                      onClick={() => setIsPlaying((p) => !p)}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      {isPlaying ? t('common.pause') : t('common.play')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 dark:text-slate-500 max-w-sm">
              <Hand className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium">{t('spelling.emptyTitle')}</p>
              <p className="text-sm mt-1">{t('spelling.emptyDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
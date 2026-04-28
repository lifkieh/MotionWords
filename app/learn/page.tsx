'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { cn } from '../components/Navbar';
import { useTranslation } from '../components/LanguageContext';
import { ALPHABET, alphabetData, PLACEHOLDER_IMAGE } from '@/data/alphabet';
import { type SignSystem } from '@/data/signSystems';
import SystemToggle from '@/components/SystemToggle';
import ComparisonPanel from '@/components/ComparisonPanel';

export default function LearnAlphabet() {
  const { t } = useTranslation();
  const [activeSystems, setActiveSystems] = useState<SignSystem[]>(['bisindo']);
  const [activeLetters, setActiveLetters] = useState<Set<string>>(new Set(['A']));
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [selectionMode, setSelectionMode] = useState<'single' | 'multi'>('multi');

  const toggleLetter = (letter: string) => {
    if (selectionMode === 'single') {
      setActiveLetters(new Set([letter]));
    } else {
      setActiveLetters((prev) => {
        const next = new Set(prev);
        if (next.has(letter)) {
          next.delete(letter);
        } else {
          next.add(letter);
        }
        return next;
      });
    }
  };

  const activeLetterArray = ALPHABET.filter((l) => activeLetters.has(l));

  // Swipe navigation for comparison mode
  const handleSwipePrev = useCallback(() => {
    setSwipeIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSwipeNext = useCallback(() => {
    setSwipeIndex((prev) => Math.min(activeLetterArray.length - 1, prev + 1));
  }, [activeLetterArray.length]);

  // Clamp swipe index when active letters change
  const clampedSwipeIndex = Math.min(swipeIndex, Math.max(0, activeLetterArray.length - 1));

  const isComparing = activeSystems.length >= 2;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {t('learn.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          {t('learn.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Letters Display (LEFT) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              {t('learn.activeLetters')} ({activeLetterArray.length})
            </h3>

            {activeLetterArray.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                <Hand className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>{t('learn.noActive')}</p>
              </div>
            ) : isComparing ? (
              /* Comparison Mode: show one letter at a time with swipe */
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLetterArray[clampedSwipeIndex]}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="text-center mb-6">
                      <span className="text-6xl font-black text-slate-900 dark:text-white">
                        {activeLetterArray[clampedSwipeIndex]}
                      </span>
                    </div>
                    <ComparisonPanel
                      activeSystems={activeSystems}
                      currentLetter={activeLetterArray[clampedSwipeIndex]}
                      showSwipe={activeLetterArray.length > 1}
                      onSwipePrev={handleSwipePrev}
                      onSwipeNext={handleSwipeNext}
                      canSwipePrev={clampedSwipeIndex > 0}
                      canSwipeNext={clampedSwipeIndex < activeLetterArray.length - 1}
                      renderPanel={(system) => {
                        const frames = alphabetData[activeLetterArray[clampedSwipeIndex]]?.[system] ?? [];
                        const src = frames[0] ?? PLACEHOLDER_IMAGE;
                        return (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img
                                src={src}
                                alt={`${activeLetterArray[clampedSwipeIndex]} in ${system}`}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                                }}
                              />
                            </div>
                          </div>
                        );
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              /* Single System: show all active letters in a grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                <AnimatePresence>
                  {activeLetterArray.map((letter) => {
                    const frames = alphabetData[letter]?.[activeSystems[0]] ?? [];
                    const src = frames[0] ?? PLACEHOLDER_IMAGE;
                    return (
                      <motion.div
                        key={letter}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="w-full aspect-square bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                          <img
                            src={src}
                            alt={`${letter} in ${activeSystems[0]}`}
                            className="w-full h-full object-contain p-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        </div>
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
                          {letter}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel (RIGHT) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* Sign System Section */}
            <div className="mb-8">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {t('learn.signSystems')}
              </h3>
              <SystemToggle activeSystems={activeSystems} onChange={setActiveSystems} />
              {isComparing && (
                <p className="mt-3 text-xs text-brand-600 dark:text-brand-400 font-medium">
                  ✨ {t('learn.comparison')}
                </p>
              )}
            </div>

            <hr className="my-6 border-slate-200 dark:border-slate-800" />

            {/* Alphabet Toggle Section */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                {t('learn.toggleLetters')}
              </h3>
              
              {/* Selection Mode Toggle */}
              <div className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl flex mb-4">
                <button
                  onClick={() => setSelectionMode('single')}
                  className={cn(
                    'flex-1 px-2 py-2 rounded-lg font-medium text-xs transition-all',
                    selectionMode === 'single'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  Single Focus
                </button>
                <button
                  onClick={() => setSelectionMode('multi')}
                  className={cn(
                    'flex-1 px-2 py-2 rounded-lg font-medium text-xs transition-all',
                    selectionMode === 'multi'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  Multi-Letter
                </button>
              </div>
              
              <div className="grid grid-cols-5 gap-1.5">
                {ALPHABET.map((letter) => {
                  const isActive = activeLetters.has(letter);
                  return (
                    <button
                      key={letter}
                      onClick={() => toggleLetter(letter)}
                      className={cn(
                        'aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200',
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm scale-105'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'
                      )}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
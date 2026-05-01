'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Layers, Grid } from 'lucide-react';
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
  const handleSwipePrev = useCallback(() => setSwipeIndex((prev) => Math.max(0, prev - 1)), []);
  const handleSwipeNext = useCallback(() => setSwipeIndex((prev) => Math.min(activeLetterArray.length - 1, prev + 1)), [activeLetterArray.length]);
  const clampedSwipeIndex = Math.min(swipeIndex, Math.max(0, activeLetterArray.length - 1));
  const isComparing = activeSystems.length >= 2;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
            <Layers className="w-3 h-3" />
            Level 01
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {t('learn.title')}
        </h1>
        <p className="text-white/40 text-sm max-w-xl font-light">
          {t('learn.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main display */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6 md:p-8 min-h-[500px]">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6">
              {t('learn.activeLetters')} <span className="text-indigo-400 ml-1">({activeLetterArray.length})</span>
            </h3>

            {activeLetterArray.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <Hand className="w-14 h-14 mb-4 opacity-30" />
                <p className="text-sm">{t('learn.noActive')}</p>
              </div>
            ) : isComparing ? (
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLetterArray[clampedSwipeIndex]}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-center mb-6">
                      <span
                        className="text-7xl font-black text-white"
                        style={{ fontFamily: 'Syne, sans-serif' }}
                      >
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
                            <div className="w-36 h-36 bg-white/[0.05] rounded-2xl border border-white/[0.08] flex items-center justify-center overflow-hidden">
                              <img
                                src={src}
                                alt={`${activeLetterArray[clampedSwipeIndex]} in ${system}`}
                                className="w-full h-full object-contain p-3"
                                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                <AnimatePresence>
                  {activeLetterArray.map((letter) => {
                    const frames = alphabetData[letter]?.[activeSystems[0]] ?? [];
                    const src = frames[0] ?? PLACEHOLDER_IMAGE;
                    return (
                      <motion.div
                        key={letter}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        className="group flex flex-col items-center gap-3"
                      >
                        <div className="w-full aspect-square bg-white/[0.04] hover:bg-white/[0.07] rounded-2xl border border-white/[0.07] hover:border-indigo-500/30 flex items-center justify-center overflow-hidden transition-all duration-200">
                          <img
                            src={src}
                            alt={`${letter} in ${activeSystems[0]}`}
                            className="w-full h-full object-contain p-3"
                            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                          />
                        </div>
                        <span
                          className="text-2xl font-black text-white/80 group-hover:text-white transition-colors"
                          style={{ fontFamily: 'Syne, sans-serif' }}
                        >
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

        {/* Settings panel */}
        <div className="space-y-5">
          {/* Sign systems */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              {t('learn.signSystems')}
            </h3>
            <SystemToggle activeSystems={activeSystems} onChange={setActiveSystems} />
            {isComparing && (
              <p className="mt-3 text-xs text-indigo-400/80 font-medium">
                ✦ {t('learn.comparison')}
              </p>
            )}
          </div>

          {/* Alphabet grid */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              {t('learn.toggleLetters')}
            </h3>
            
            {/* Mode toggle */}
            <div className="flex bg-white/[0.05] p-1 rounded-xl mb-4 gap-1">
              {(['single', 'multi'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectionMode(mode)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all capitalize',
                    selectionMode === mode
                      ? 'bg-indigo-500/30 text-indigo-300'
                      : 'text-white/40 hover:text-white/70'
                  )}
                >
                  {mode === 'single' ? 'Single' : 'Multi'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {ALPHABET.map((letter) => {
                const isActive = activeLetters.has(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => toggleLetter(letter)}
                    className={cn(
                      'aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-150',
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70 border border-white/[0.06]'
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
  );
}
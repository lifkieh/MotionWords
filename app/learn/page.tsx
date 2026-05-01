'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
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
  const handleSwipeNext = useCallback(
    () => setSwipeIndex((prev) => Math.min(activeLetterArray.length - 1, prev + 1)),
    [activeLetterArray.length]
  );
  const clampedSwipeIndex = Math.min(swipeIndex, Math.max(0, activeLetterArray.length - 1));
  const isComparing = activeSystems.length >= 2;

  return (
    <div
      className="flex-1 w-full"
      style={{ background: 'var(--bg)', minHeight: '100vh' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* ── Page Header ── */}
        <div className="mb-8 anim-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="eyebrow">
              <Layers className="w-3 h-3" />
              Level 01
            </span>
          </div>
          <h1 className="section-title mb-2">{t('learn.title')}</h1>
          <p className="text-sm" style={{ color: 'var(--t2)', maxWidth: '480px', lineHeight: '1.65' }}>
            {t('learn.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Main Display ── */}
          <div className="lg:col-span-2 anim-fade-up delay-1">
            <div
              className="card"
              style={{ padding: '28px', minHeight: '520px' }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="section-over" style={{ marginBottom: 0 }}>{t('learn.activeLetters')}</p>
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--ac)' }}
                  >
                    {activeLetterArray.length} selected
                  </span>
                </div>
                {isComparing && activeLetterArray.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSwipePrev}
                      disabled={clampedSwipeIndex === 0}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: clampedSwipeIndex === 0 ? 'var(--s3)' : 'var(--s2)',
                        border: '1px solid var(--bd)',
                        color: clampedSwipeIndex === 0 ? 'var(--t3)' : 'var(--t2)',
                        cursor: clampedSwipeIndex === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium" style={{ color: 'var(--t3)' }}>
                      {clampedSwipeIndex + 1} / {activeLetterArray.length}
                    </span>
                    <button
                      onClick={handleSwipeNext}
                      disabled={clampedSwipeIndex >= activeLetterArray.length - 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: clampedSwipeIndex >= activeLetterArray.length - 1 ? 'var(--s3)' : 'var(--s2)',
                        border: '1px solid var(--bd)',
                        color: clampedSwipeIndex >= activeLetterArray.length - 1 ? 'var(--t3)' : 'var(--t2)',
                        cursor: clampedSwipeIndex >= activeLetterArray.length - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              {activeLetterArray.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-20 text-center"
                  style={{ color: 'var(--t3)' }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}
                  >
                    <span style={{ fontSize: '28px' }}>👆</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--t2)' }}>
                    {t('learn.noActive')}
                  </p>
                </div>
              ) : isComparing ? (
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeLetterArray[clampedSwipeIndex]}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.22 }}
                    >
                      {/* Big letter display */}
                      <div
                        className="text-center mb-6 py-4 rounded-2xl"
                        style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}
                      >
                        <span
                          className="font-bold"
                          style={{
                            fontSize: '72px',
                            letterSpacing: '-0.04em',
                            color: 'var(--t1)',
                            lineHeight: 1,
                          }}
                        >
                          {activeLetterArray[clampedSwipeIndex]}
                        </span>
                      </div>
                      <ComparisonPanel
                        activeSystems={activeSystems}
                        currentLetter={activeLetterArray[clampedSwipeIndex]}
                        renderPanel={(system) => {
                          const frames = alphabetData[activeLetterArray[clampedSwipeIndex]]?.[system] ?? [];
                          const src = frames[0] ?? PLACEHOLDER_IMAGE;
                          return (
                            <div
                              className="w-32 h-32 rounded-xl overflow-hidden flex items-center justify-center"
                              style={{ background: 'var(--s1)', border: '1px solid var(--bd)' }}
                            >
                              <img
                                src={src}
                                alt={`${activeLetterArray[clampedSwipeIndex]} in ${system}`}
                                className="w-full h-full object-contain p-3"
                                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                              />
                            </div>
                          );
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  <AnimatePresence>
                    {activeLetterArray.map((letter, i) => {
                      const frames = alphabetData[letter]?.[activeSystems[0]] ?? [];
                      const src = frames[0] ?? PLACEHOLDER_IMAGE;
                      return (
                        <motion.div
                          key={letter}
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.03 } }}
                          exit={{ opacity: 0, scale: 0.88 }}
                          className="letter-tile"
                        >
                          <div className="letter-tile-img">
                            <img
                              src={src}
                              alt={`${letter} in ${activeSystems[0]}`}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                            />
                          </div>
                          <span className="letter-tile-char">{letter}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* ── Settings Panel ── */}
          <div className="space-y-4 anim-fade-up delay-2">

            {/* Sign Systems */}
            <div className="card" style={{ padding: '20px' }}>
              <p className="section-over">{t('learn.signSystems')}</p>
              <SystemToggle activeSystems={activeSystems} onChange={setActiveSystems} />
              {isComparing && (
                <div
                  className="mt-3 px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'var(--ac-bg)', color: 'var(--ac-t)', border: '1px solid var(--ac-bd)' }}
                >
                  ✦ {t('learn.comparison')}
                </div>
              )}
            </div>

            {/* Alphabet Grid */}
            <div className="card" style={{ padding: '20px' }}>
              <p className="section-over">{t('learn.toggleLetters')}</p>

              {/* Mode Toggle */}
              <div
                className="flex mb-4 p-1 rounded-xl gap-1"
                style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}
              >
                {(['single', 'multi'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectionMode(mode)}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all capitalize"
                    style={
                      selectionMode === mode
                        ? {
                            background: 'var(--s1)',
                            color: 'var(--t1)',
                            boxShadow: '0 1px 3px rgba(0,0,0,.08), 0 0 0 0.5px var(--bd2)',
                          }
                        : { color: 'var(--t3)' }
                    }
                  >
                    {mode === 'single' ? 'Single' : 'Multi'}
                  </button>
                ))}
              </div>

              {/* Letter buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {ALPHABET.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => toggleLetter(letter)}
                    className={cn('alpha-btn', activeLetters.has(letter) && 'active')}
                    style={{ height: '34px' }}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveLetters(new Set(ALPHABET))}
                  className="btn btn-ghost btn-sm flex-1 text-xs"
                >
                  All
                </button>
                <button
                  onClick={() => setActiveLetters(new Set())}
                  className="btn btn-ghost btn-sm flex-1 text-xs"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
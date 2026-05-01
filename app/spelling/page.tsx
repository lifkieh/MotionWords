'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MessageSquare } from 'lucide-react';
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

  const handleStopMotionComplete = useCallback(() => {
    setStopMotionIndex((prev) => {
      if (prev < chars.length - 1) return prev + 1;
      setIsPlaying(false);
      return prev;
    });
  }, [chars.length]);

  return (
    <div className="flex-1 w-full" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* ── Page Header ── */}
        <div className="mb-8 anim-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="eyebrow">
              <MessageSquare className="w-3 h-3" />
              Level 02
            </span>
          </div>
          <h1 className="section-title mb-2">{t('spelling.title')}</h1>
          <p className="text-sm" style={{ color: 'var(--t2)', maxWidth: '480px', lineHeight: '1.65' }}>
            {t('spelling.subtitle')}
          </p>
        </div>

        {/* ── Controls bar ── */}
        <div className="card mb-5 anim-fade-up delay-1" style={{ padding: '20px' }}>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">

            {/* View mode toggle */}
            <div
              className="flex p-1 rounded-xl gap-1 flex-shrink-0"
              style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}
            >
              {([
                { key: 'sequence', label: t('spelling.sequence') },
                { key: 'stopmotion', label: t('spelling.stopMotion') },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={
                    viewMode === key
                      ? {
                          background: 'var(--ac)',
                          color: '#fff',
                          boxShadow: '0 1px 4px rgba(74,108,247,.3)',
                        }
                      : { color: 'var(--t2)' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search form */}
            <form onSubmit={handleTranslate} className="flex-1 flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4" style={{ color: 'var(--t3)' }} />
                </div>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder={t('spelling.placeholder')}
                  className="block w-full pl-10 pr-9 py-2.5 rounded-xl text-sm transition-all"
                  style={{
                    background: 'var(--s2)',
                    border: '1px solid var(--bd)',
                    color: 'var(--t1)',
                    outline: 'none',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--ac)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--bd)')}
                />
                {word && (
                  <button
                    type="button"
                    onClick={() => { setWord(''); setTranslatedWord(''); }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    style={{ color: 'var(--t3)' }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={!word.trim()}
                className="btn btn-primary btn-md"
                style={{ opacity: !word.trim() ? 0.45 : 1, cursor: !word.trim() ? 'not-allowed' : 'pointer' }}
              >
                {t('spelling.translate')}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* ── Sidebar ── */}
          <div className="space-y-4 anim-fade-up delay-2">
            {/* Sign Systems */}
            <div className="card" style={{ padding: '20px' }}>
              <p className="section-over">Sign Systems</p>
              <SystemToggle activeSystems={activeSystems} onChange={setActiveSystems} />
            </div>

            {/* Speed (stop motion only) */}
            {viewMode === 'stopmotion' && (
              <div className="card" style={{ padding: '20px' }}>
                <p className="section-over">Speed</p>
                <SpeedControl speed={speed} onChange={setSpeed} />
              </div>
            )}

            {/* Stop motion controls */}
            {viewMode === 'stopmotion' && translatedWord && chars.length > 0 && (
              <div className="card" style={{ padding: '20px' }}>
                <p className="section-over">Playback</p>
                {/* Letter progress */}
                <div
                  className="flex flex-wrap gap-1 mb-4 p-3 rounded-xl"
                  style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}
                >
                  {chars.map((char, idx) => (
                    <span
                      key={idx}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                      style={
                        idx === stopMotionIndex
                          ? { background: 'var(--ac)', color: '#fff', transform: 'scale(1.1)' }
                          : idx < stopMotionIndex
                          ? { background: 'var(--ac-bg)', color: 'var(--ac-t)', border: '1px solid var(--ac-bd)' }
                          : { background: 'var(--s3)', color: 'var(--t3)' }
                      }
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setStopMotionIndex(0); setIsPlaying(true); }}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    {t('common.reset')}
                  </button>
                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    {isPlaying ? t('common.pause') : t('common.play')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Main Result Area ── */}
          <div className="lg:col-span-3 anim-fade-up delay-3">
            <div
              className="card"
              style={{ padding: '28px', minHeight: '380px' }}
            >
              {translatedWord ? (
                <div className="w-full">
                  {/* Word display */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="flex-1 h-px"
                      style={{ background: 'var(--bd)' }}
                    />
                    <span
                      className="font-bold tracking-wider px-4 py-1.5 rounded-xl"
                      style={{
                        fontSize: '13px',
                        color: 'var(--ac-t)',
                        background: 'var(--ac-bg)',
                        border: '1px solid var(--ac-bd)',
                        letterSpacing: '0.12em',
                      }}
                    >
                      {translatedWord}
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: 'var(--bd)' }}
                    />
                  </div>

                  {viewMode === 'sequence' ? (
                    isComparing ? (
                      /* Comparison sequence */
                      <div className="space-y-6">
                        {translatedWord.split('').map((char, index) => {
                          if (char === ' ') return <div key={`space-${index}`} className="h-2" />;
                          return (
                            <motion.div
                              key={`${char}-${index}`}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.04 }}
                            >
                              <div
                                className="text-center mb-3 w-10 h-10 rounded-xl flex items-center justify-center font-bold mx-auto"
                                style={{
                                  background: 'var(--s2)',
                                  border: '1px solid var(--bd)',
                                  fontSize: '18px',
                                  color: 'var(--t1)',
                                }}
                              >
                                {char}
                              </div>
                              <ComparisonPanel
                                activeSystems={activeSystems}
                                currentLetter={char}
                                renderPanel={(system) => {
                                  const frames = alphabetData[char]?.[system] ?? [];
                                  const src = frames[0] ?? PLACEHOLDER_IMAGE;
                                  return (
                                    <div
                                      className="w-24 h-24 rounded-xl overflow-hidden"
                                      style={{ background: 'var(--s1)', border: '1px solid var(--bd)' }}
                                    >
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
                      <div className="flex flex-wrap gap-3 justify-center">
                        <AnimatePresence>
                          {translatedWord.split('').map((char, index) => {
                            if (char === ' ') return <div key={`space-${index}`} className="w-6" />;
                            const frames = alphabetData[char]?.[activeSystems[0]] ?? [];
                            const src = frames[0] ?? PLACEHOLDER_IMAGE;
                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.07 } }}
                                key={`${char}-${index}`}
                                className="flex flex-col items-center gap-2"
                              >
                                <div
                                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center overflow-hidden transition-all card-hover"
                                  style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}
                                >
                                  <img
                                    src={src}
                                    alt={`${char} in ${activeSystems[0]}`}
                                    className="w-full h-full object-contain p-1.5"
                                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                                  />
                                </div>
                                <span
                                  className="text-base font-bold"
                                  style={{ color: 'var(--t1)' }}
                                >
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
                            frames={
                              (alphabetData[chars[stopMotionIndex]]?.[activeSystems[0]] ?? []).length > 0
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
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state */
                <div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  style={{ color: 'var(--t3)' }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}
                  >
                    <span style={{ fontSize: '28px' }}>✍️</span>
                  </div>
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--t2)' }}>
                    {t('spelling.emptyTitle')}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>
                    {t('spelling.emptyDesc')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
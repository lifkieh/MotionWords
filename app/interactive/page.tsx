'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Hand, Settings, Activity } from 'lucide-react';
import { cn } from '../components/Navbar';
import { useTranslation } from '../components/LanguageContext';
import { getSignImage, PLACEHOLDER_IMAGE } from '@/data/alphabet';
import { type SignSystem, SIGN_SYSTEM_MAP } from '@/data/signSystems';
import SystemToggle from '@/components/SystemToggle';
import ComparisonPanel from '@/components/ComparisonPanel';
import SpeedControl from '@/components/SpeedControl';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

export default function Interactive() {
  const { t } = useTranslation();
  const [activeSystems, setActiveSystems] = useState<SignSystem[]>(['bisindo']);
  const [speed, setSpeed] = useState(800);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const [currentWord, setCurrentWord] = useState('');
  const [stopMotionIndex, setStopMotionIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'id-ID';

        recognitionRef.current.onresult = (event: any) => {
          let cur = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            cur += event.results[i][0].transcript;
          }
          setTranscript(cur);

          if (event.results[event.results.length - 1].isFinal) {
            const finalWord = event.results[event.results.length - 1][0].transcript
              .trim()
              .toUpperCase()
              .replace(/[^A-Z]/g, '');
            if (finalWord) triggerStopMotion(finalWord);
          }
        };

        recognitionRef.current.onerror = () => setIsListening(false);

        recognitionRef.current.onend = () => {
          if (isListening) {
            try { recognitionRef.current?.start(); } catch (e) {}
          }
        };
      }
    }
    return () => { recognitionRef.current?.stop(); };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        setTranscript('');
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {}
    }
  };

  const triggerStopMotion = (word: string) => {
    setCurrentWord(word);
    setStopMotionIndex(0);
    setIsPlaying(true);
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const chars = currentWord.split('');
  const isComparing = activeSystems.length >= 2;

  useEffect(() => {
    if (!isPlaying || chars.length === 0) return;

    const timer = setInterval(() => {
      setStopMotionIndex((prev) => {
        if (prev < chars.length - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, chars.length, speed]);

  return (
    <div className="flex-1 w-full" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* ── Page Header ── */}
        <div className="mb-8 anim-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="eyebrow">
              <Mic className="w-3 h-3" />
              Level 03
            </span>
          </div>
          <h1 className="section-title mb-2">{t('interactive.title')}</h1>
          <p className="text-sm" style={{ color: 'var(--t2)', maxWidth: '480px', lineHeight: '1.65' }}>
            {t('interactive.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Settings Sidebar ── */}
          <div className="space-y-4 anim-fade-up delay-1">
            <div className="card" style={{ padding: '20px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-3.5 h-3.5" style={{ color: 'var(--t3)' }} />
                <p className="section-over" style={{ marginBottom: 0 }}>
                  {t('interactive.preferences')}
                </p>
              </div>

              <div className="space-y-6">
                {/* Sign System */}
                <div>
                  <p className="section-over">{t('interactive.signSystem')}</p>
                  <SystemToggle activeSystems={activeSystems} onChange={setActiveSystems} />
                </div>

                {/* Speed */}
                <div>
                  <p className="section-over">{t('interactive.speed')}</p>
                  <SpeedControl speed={speed} onChange={setSpeed} />
                </div>
              </div>
            </div>

            {/* Word history / current word info */}
            {currentWord && (
              <div className="card anim-fade-up" style={{ padding: '20px' }}>
                <p className="section-over">Current Word</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {chars.map((char, idx) => (
                    <span
                      key={idx}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                      style={
                        idx === stopMotionIndex
                          ? { background: 'var(--ac)', color: '#fff' }
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
                    onClick={() => {
                      setCurrentWord('');
                      setTranscript('');
                      setStopMotionIndex(-1);
                      setIsPlaying(false);
                    }}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    {t('common.reset')}
                  </button>
                  <button
                    onClick={() => {
                      if (stopMotionIndex >= chars.length - 1 && !isPlaying) {
                        setStopMotionIndex(0);
                        setIsPlaying(true);
                      } else {
                        setIsPlaying((p) => !p);
                      }
                    }}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    {isPlaying ? t('common.pause') : t('common.play')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Main Interactive Area ── */}
          <div className="lg:col-span-2 anim-fade-up delay-2">
            <div className="card" style={{ padding: '28px' }}>

              {/* ── Mic Button ── */}
              <div className="flex flex-col items-center mb-8">
                {/* Mic */}
                <div className="relative mb-5">
                  {isListening && (
                    <>
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: 'rgba(239,68,68,0.25)', animationDuration: '1.4s' }}
                      />
                      <span
                        className="absolute -inset-3 rounded-full animate-ping"
                        style={{ background: 'rgba(239,68,68,0.1)', animationDuration: '2s', animationDelay: '0.3s' }}
                      />
                    </>
                  )}
                  <button
                    onClick={toggleListening}
                    className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isListening
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : 'linear-gradient(135deg, var(--ac), var(--ac-t))',
                      boxShadow: isListening
                        ? '0 8px 32px rgba(239,68,68,.35)'
                        : '0 8px 32px rgba(74,108,247,.35)',
                      color: '#fff',
                    }}
                  >
                    {isListening ? (
                      <MicOff className="w-7 h-7" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>
                </div>

                {/* Transcript / status */}
                <div
                  className="w-full max-w-sm rounded-2xl flex items-center justify-center gap-3 transition-all"
                  style={{
                    background: isListening ? 'var(--ac-bg)' : 'var(--s2)',
                    border: `1px solid ${isListening ? 'var(--ac-bd)' : 'var(--bd)'}`,
                    minHeight: '48px',
                    padding: '10px 16px',
                  }}
                >
                  {isListening ? (
                    <>
                      <Activity
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: 'var(--ac)', animation: 'dot-pulse 1.4s ease infinite' }}
                      />
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--ac-t)' }}
                      >
                        {transcript || t('interactive.listening')}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--t3)' }}>
                      {chars.length > 0 ? t('interactive.micReady') : t('interactive.tapMic')}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Stop Motion Viewer ── */}
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  minHeight: '340px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '28px',
                }}
              >
                {chars.length > 0 && stopMotionIndex >= 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      {stopMotionIndex < chars.length && (
                        <motion.div
                          key={stopMotionIndex}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                          className="w-full flex flex-col items-center"
                        >
                          {isComparing ? (
                            <ComparisonPanel
                              activeSystems={activeSystems}
                              currentLetter={chars[stopMotionIndex]}
                              renderPanel={(system) => {
                                return (
                                  <img
                                    src={getSignImage(system, chars[stopMotionIndex])}
                                    alt={chars[stopMotionIndex]}
                                    className="w-full h-full object-contain p-2"
                                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                                  />
                                );
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-slate-900 border-4 flex items-center justify-center" style={{ borderColor: 'var(--ac)' }}>
                                <img
                                  src={getSignImage(activeSystems[0], chars[stopMotionIndex])}
                                  alt={chars[stopMotionIndex]}
                                  className="w-full h-full object-contain"
                                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                                />
                              </div>
                              <div
                                className="font-bold text-center"
                                style={{
                                  fontSize: '64px',
                                  color: 'var(--t1)',
                                  letterSpacing: '-0.04em',
                                  lineHeight: 1,
                                }}
                              >
                                {chars[stopMotionIndex]}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  /* Empty state */
                  <div className="text-center">
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'var(--s3)', border: '1px solid var(--bd)' }}
                    >
                      <Hand className="w-9 h-9" style={{ color: 'var(--t3)' }} />
                    </div>
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--t2)' }}>
                      {t('interactive.stopMotionViewer')}
                    </p>
                    <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--t3)', lineHeight: '1.6' }}>
                      {t('interactive.waiting')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
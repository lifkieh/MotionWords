'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Hand, Settings, Activity } from 'lucide-react';
import { cn } from '../components/Navbar';
import { useTranslation } from '../components/LanguageContext';
import { alphabetData, PLACEHOLDER_IMAGE } from '@/data/alphabet';
import { type SignSystem, SIGN_SYSTEM_MAP } from '@/data/signSystems';
import SystemToggle from '@/components/SystemToggle';
import ComparisonPanel from '@/components/ComparisonPanel';
import SignPlayer from '@/components/SignPlayer';
import SpeedControl from '@/components/SpeedControl';

// Simplified types for Web Speech API
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
  
  // Animation state
  const [currentWord, setCurrentWord] = useState('');
  const [stopMotionIndex, setStopMotionIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        // Use Indonesian as primary, can be configurable later
        recognitionRef.current.lang = 'id-ID';

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          
          if (event.results[event.results.length - 1].isFinal) {
            const finalWord = event.results[event.results.length - 1][0].transcript.trim().toUpperCase().replace(/[^A-Z]/g, '');
            if (finalWord) {
              triggerStopMotion(finalWord);
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          // If we intentionally stopped it (e.g. word finished), keep it off
          // If it died randomly while we still want it on, restart it
          if (isListening) {
            try {
              recognitionRef.current?.start();
            } catch(e) {}
          }
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
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
      } catch (e) {
        console.error(e);
      }
    }
  };

  const triggerStopMotion = (word: string) => {
    setCurrentWord(word);
    setStopMotionIndex(0);
    setIsPlaying(true);
    // Turn off mic immediately
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const chars = currentWord.split('');
  const isComparing = activeSystems.length >= 2;

  // Stop motion callback
  const handleStopMotionComplete = useCallback(() => {
    setStopMotionIndex((prev) => {
      if (prev < chars.length - 1) return prev + 1;
      
      // Sequence completed!
      setIsPlaying(false);
      return prev;
    });
  }, [chars.length]);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {t('interactive.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          {t('interactive.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-brand-500" />
              {t('interactive.preferences')}
            </h3>
            
            <div className="space-y-8">
              {/* Sign System */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {t('interactive.signSystem')}
                </label>
                <SystemToggle activeSystems={activeSystems} onChange={setActiveSystems} />
              </div>



              {/* Speed Control */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {t('interactive.speed')}
                </label>
                <SpeedControl speed={speed} onChange={setSpeed} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Interactive Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            
            {/* Voice Control */}
            <div className="mb-10 w-full flex flex-col items-center">
              <button
                onClick={toggleListening}
                className={cn(
                  "relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
                  isListening 
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/30" 
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30"
                )}
              >
                {isListening && (
                  <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                )}
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              
              <div className="mt-6 text-center h-16 flex items-center justify-center w-full max-w-md">
                {isListening ? (
                  <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-2xl w-full border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3">
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                      {transcript || t('interactive.listening')}
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-500 font-medium">
                    {chars.length > 0 ? t('interactive.micReady') : t('interactive.tapMic')}
                  </p>
                )}
              </div>
            </div>

            {/* Stop Motion Viewer */}
            <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px] relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-8">
              {chars.length > 0 && stopMotionIndex >= 0 ? (
                <>
                  <div className="text-xl font-bold mb-8 tracking-widest text-slate-400">
                    {chars.map((char, idx) => (
                      <span key={idx} className={cn(
                        "mx-1 transition-colors duration-200",
                        idx === stopMotionIndex ? "text-brand-500 dark:text-brand-400 scale-125 inline-block" : ""
                      )}>
                        {char}
                      </span>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {stopMotionIndex < chars.length && (
                      <motion.div
                        key={stopMotionIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-2xl flex flex-col items-center"
                      >
                        {isComparing ? (
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
                                />
                              );
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <SignPlayer
                              frames={(alphabetData[chars[stopMotionIndex]]?.[activeSystems[0]] ?? []).length > 0
                                ? alphabetData[chars[stopMotionIndex]][activeSystems[0]]
                                : [PLACEHOLDER_IMAGE]
                              }
                              speed={speed}
                              autoPlay={isPlaying}
                              onComplete={handleStopMotionComplete}
                              showControls={false}
                              className="scale-125 mb-4"
                            />
                            <div className="text-6xl font-black text-slate-900 dark:text-white mt-4">
                              {chars[stopMotionIndex]}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Manual controls */}
                  <div className="flex items-center gap-3 mt-8">
                    <button
                      onClick={() => {
                        setCurrentWord('');
                        setTranscript('');
                        setStopMotionIndex(-1);
                        setIsPlaying(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors"
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
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      {isPlaying ? t('common.pause') : t('common.play')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400">
                  <Hand className="w-20 h-20 mx-auto mb-6 opacity-20" />
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                    {t('interactive.stopMotionViewer')}
                  </p>
                  <p className="text-sm mt-2 max-w-sm mx-auto opacity-70">
                    {t('interactive.waiting')}
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

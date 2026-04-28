'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Hand, Settings, Activity } from 'lucide-react';
import { cn } from '../components/Navbar';

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
  const [system, setSystem] = useState<'bisindo' | 'sibi'>('bisindo');
  const [disabilityProfile, setDisabilityProfile] = useState<'deaf' | 'mute' | 'motor'>('deaf');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [activeFrameIndex, setActiveFrameIndex] = useState(-1);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
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
          if (isListening) {
            // Auto restart if it was stopped unintentionally
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
  }, []);

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
    const chars = word.split('');
    setCurrentSequence(chars);
    setActiveFrameIndex(0);
  };

  useEffect(() => {
    if (activeFrameIndex >= 0 && activeFrameIndex < currentSequence.length) {
      // Adjust speed based on disability profile
      const speed = disabilityProfile === 'motor' ? 1500 : 800; // Slower for motor disabilities
      const timer = setTimeout(() => {
        setActiveFrameIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (activeFrameIndex >= currentSequence.length) {
      // Reset after sequence ends
      const timer = setTimeout(() => {
        setCurrentSequence([]);
        setActiveFrameIndex(-1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeFrameIndex, currentSequence, disabilityProfile]);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Level 3: Interactive Practice
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Use voice recognition to trigger stop-motion sign language sequences. Tailored for different accessibility needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-brand-500" />
              Preferences
            </h3>
            
            <div className="space-y-6">
              {/* Sign System */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Sign Language System
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setSystem('bisindo')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                      system === 'bisindo' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'
                    )}
                  >
                    BISINDO
                  </button>
                  <button
                    onClick={() => setSystem('sibi')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                      system === 'sibi' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-500'
                    )}
                  >
                    SIBI
                  </button>
                </div>
              </div>

              {/* Disability Profile */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Accessibility Profile
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setDisabilityProfile('deaf')}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border transition-all',
                      disabilityProfile === 'deaf' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="font-semibold text-sm">Deaf / Hard of Hearing</div>
                    <div className="text-xs opacity-80 mt-1">Focus on visual clarity and standard speed</div>
                  </button>
                  <button
                    onClick={() => setDisabilityProfile('mute')}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border transition-all',
                      disabilityProfile === 'mute' 
                        ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="font-semibold text-sm">Speech Impairment</div>
                    <div className="text-xs opacity-80 mt-1">Enable text fallback and gesture recognition</div>
                  </button>
                  <button
                    onClick={() => setDisabilityProfile('motor')}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border transition-all',
                      disabilityProfile === 'motor' 
                        ? 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="font-semibold text-sm">Motor/Cognitive Impairment</div>
                    <div className="text-xs opacity-80 mt-1">Slower stop-motion frame rate for easier tracking</div>
                  </button>
                </div>
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
                      {transcript || "Listening..."}
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-500">Tap the microphone and say a word to translate.</p>
                )}
              </div>
            </div>

            {/* Stop Motion Viewer */}
            <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px] relative overflow-hidden flex flex-col items-center justify-center p-8">
              {currentSequence.length > 0 ? (
                <>
                  <div className="text-xl font-bold mb-8 tracking-widest text-slate-400">
                    {currentSequence.map((char, idx) => (
                      <span key={idx} className={cn(
                        "mx-1 transition-colors",
                        idx === activeFrameIndex ? "text-brand-500 dark:text-brand-400 scale-125 inline-block" : ""
                      )}>
                        {char}
                      </span>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {activeFrameIndex < currentSequence.length && (
                      <motion.div
                        key={activeFrameIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <div className={cn(
                          "w-48 h-48 rounded-full flex items-center justify-center mb-6 relative border-4",
                          system === 'bisindo' ? "bg-brand-50 border-brand-200 dark:bg-slate-800" : "bg-purple-50 border-purple-200 dark:bg-slate-800"
                        )}>
                          {/* Placeholder for actual stop motion frame */}
                          <Hand className={cn(
                            "w-24 h-24",
                            system === 'bisindo' ? "text-brand-500" : "text-purple-500"
                          )} />
                          <div className="absolute top-2 right-2 bg-white dark:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                            {activeFrameIndex + 1}/{currentSequence.length}
                          </div>
                        </div>
                        <div className="text-6xl font-black text-slate-900 dark:text-white">
                          {currentSequence[activeFrameIndex]}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="text-center text-slate-400">
                  <Hand className="w-20 h-20 mx-auto mb-6 opacity-20" />
                  <p className="text-lg">Stop Motion Frame Viewer</p>
                  <p className="text-sm mt-2 max-w-sm mx-auto">
                    Waiting for voice input... The animation speed will adapt based on the selected accessibility profile.
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

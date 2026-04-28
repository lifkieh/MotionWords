'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../components/Navbar';

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export default function LearnAlphabet() {
  const [system, setSystem] = useState<'bisindo' | 'sibi'>('bisindo');
  const [selectedLetter, setSelectedLetter] = useState<string>('A');

  const currentIndex = ALPHABET.indexOf(selectedLetter);

  const nextLetter = () => {
    if (currentIndex < ALPHABET.length - 1) setSelectedLetter(ALPHABET[currentIndex + 1]);
  };

  const prevLetter = () => {
    if (currentIndex > 0) setSelectedLetter(ALPHABET[currentIndex - 1]);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Level 1: Alphabet Tutor
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Learn the sign language alphabet. Choose between BISINDO and SIBI, and practice the basic hand gestures for each letter.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column: Controls and Image */}
        <div className="flex-1 flex flex-col gap-6">
          {/* System Toggle */}
          <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl inline-flex self-start">
            <button
              onClick={() => setSystem('bisindo')}
              className={cn(
                'px-6 py-2.5 rounded-xl font-medium text-sm transition-all',
                system === 'bisindo'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              BISINDO
            </button>
            <button
              onClick={() => setSystem('sibi')}
              className={cn(
                'px-6 py-2.5 rounded-xl font-medium text-sm transition-all',
                system === 'sibi'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              SIBI
            </button>
          </div>

          {/* Main Viewer */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLetter + system}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                {/* Placeholder for actual gesture image */}
                <div className="w-48 h-48 bg-brand-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 relative border-4 border-brand-100 dark:border-brand-900/50">
                  <Hand className="w-24 h-24 text-brand-500 opacity-50" />
                  <div className="absolute -bottom-4 bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                    {system}
                  </div>
                </div>
                <div className="text-8xl font-black text-slate-900 dark:text-white mb-2">
                  {selectedLetter}
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Letter {selectedLetter} in {system.toUpperCase()}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
              <button
                onClick={prevLetter}
                disabled={currentIndex === 0}
                className="pointer-events-auto w-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </button>
              <button
                onClick={nextLetter}
                disabled={currentIndex === ALPHABET.length - 1}
                className="pointer-events-auto w-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowRight className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Grid */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select a Letter</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-3">
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={cn(
                    'aspect-square rounded-xl flex items-center justify-center text-xl font-bold transition-all',
                    selectedLetter === letter
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
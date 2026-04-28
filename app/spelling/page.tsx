'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Search, X } from 'lucide-react';
import { cn } from '../components/Navbar';

export default function SpellingTutor() {
  const [system, setSystem] = useState<'bisindo' | 'sibi'>('bisindo');
  const [word, setWord] = useState('');
  const [translatedWord, setTranslatedWord] = useState('');

  const handleTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    setTranslatedWord(word.trim().toUpperCase().replace(/[^A-Z\s]/g, ''));
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Level 2: Word Translation
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Convert typed words into sign language sequences. Great for practicing spelling and building vocabulary in BISINDO or SIBI.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-2xl inline-flex self-start">
            <button
              onClick={() => setSystem('bisindo')}
              className={cn(
                'px-6 py-2.5 rounded-xl font-medium text-sm transition-all',
                system === 'bisindo'
                  ? 'bg-brand-600 text-white shadow-sm'
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
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              SIBI
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
                placeholder="Type a word (e.g. AKU, MAKAN)..."
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
              Translate
            </button>
          </form>
        </div>

        {/* Translation Result */}
        <div className="min-h-[300px] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center">
          {translatedWord ? (
            <div className="w-full">
              <h3 className="text-center text-2xl font-bold mb-10 text-slate-700 dark:text-slate-300">
                "{translatedWord}"
              </h3>
              <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                <AnimatePresence>
                  {translatedWord.split('').map((char, index) => {
                    if (char === ' ') {
                      return <div key={`space-${index}`} className="w-8" />;
                    }
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={`${char}-${index}`}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className={cn(
                          "w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2",
                          system === 'bisindo'
                            ? "bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800/50"
                            : "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50"
                        )}>
                          {/* Placeholder image for character */}
                          <Hand className={cn(
                            "w-10 h-10 md:w-12 md:h-12 opacity-60",
                            system === 'bisindo' ? "text-brand-500" : "text-purple-500"
                          )} />
                        </div>
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                          {char}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 dark:text-slate-500 max-w-sm">
              <Hand className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Type a word and hit Translate to see its sign language sequence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
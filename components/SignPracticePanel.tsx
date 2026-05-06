import { AlertCircle, RotateCcw, FastForward, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { PracticeResult } from '@/hooks/useWordPractice';
import { getSignImage, PLACEHOLDER_IMAGE } from '@/data/alphabet';

interface SignPracticePanelProps {
  word: string;
  currentLetter: string;
  result: PracticeResult;
  attempts: number;
  isFinished: boolean;
  system: string;
  onReset: () => void;
  onSkip: () => void;
}

export default function SignPracticePanel({
  word,
  currentLetter,
  result,
  attempts,
  isFinished,
  system,
  onReset,
  onSkip
}: SignPracticePanelProps) {
  
  // (Mock hints removed, using image hint directly in render)

  return (
    <div className="card p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">Sign Practice</h2>
        {attempts > 1 && !isFinished && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
            Attempt {attempts}
          </span>
        )}
      </div>

      {isFinished ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Word Completed!</h3>
            <p className="text-slate-500 mt-1">You successfully spelled &quot;{word}&quot;.</p>
          </div>
          <button onClick={onReset} className="btn btn-primary mt-4">
            Practice Another Word
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row justify-center items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Current</span>
                <div className="text-8xl font-black text-brand-600 leading-none tracking-tighter">
                  {currentLetter}
                </div>
              </div>
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                <img
                  src={getSignImage(system, currentLetter)}
                  alt={`Reference for ${currentLetter} in ${system}`}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                />
              </div>
            </div>
          </div>

          <div className={`
            flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold transition-colors
            ${result === 'Correct' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}
            ${result === 'Not Correct' ? 'bg-rose-50 border-rose-200 text-rose-700' : ''}
            ${result === 'Waiting' ? 'bg-slate-50 border-slate-200 text-slate-500' : ''}
          `}>
            {result === 'Correct' && <CheckCircle2 className="w-5 h-5" />}
            {result === 'Not Correct' && <XCircle className="w-5 h-5" />}
            {result === 'Waiting' && <Loader2 className="w-5 h-5 animate-spin" />}
            {result}
          </div>

          {/* Image Hint Box: Shows up after 3 attempts */}
          {attempts >= 3 && currentLetter !== 'J' && currentLetter !== 'Z' && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex-1">
                <p className="font-bold mb-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Hint
                </p>
                <p className="text-xs">Follow this hand shape closely.</p>
              </div>
              <img
                src={getSignImage(system, currentLetter)}
                alt={`Hint for ${currentLetter} in ${system}`}
                className="w-16 h-16 object-contain opacity-80 border-2 border-amber-400 rounded-lg bg-white p-1"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
              />
            </div>
          )}

          {(currentLetter === 'J' || currentLetter === 'Z') && (
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-center text-sm font-bold border border-blue-200 mt-2 animate-in fade-in">
              Dynamic gesture (coming soon). <br/> Please press Skip.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onReset} className="btn btn-outline flex-1">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button onClick={onSkip} className="btn btn-ghost flex-1">
               Skip <FastForward className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

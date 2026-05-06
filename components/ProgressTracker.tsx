import { Check, X } from 'lucide-react';

interface ProgressTrackerProps {
  word: string;
  currentIndex: number;
  completed: boolean[];
}

export default function ProgressTracker({ word, currentIndex, completed }: ProgressTrackerProps) {
  const chars = word.split('');

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {chars.map((char, idx) => {
        const isCurrent = idx === currentIndex;
        const isPast = idx < currentIndex;
        const isSuccess = isPast && completed[idx];
        const isFailed = isPast && !completed[idx]; // For skipped letters

        return (
          <div
            key={idx}
            className={`
              relative flex flex-col items-center justify-center w-12 h-14 rounded-xl border-2 transition-all duration-300
              ${isCurrent ? 'border-brand-500 bg-brand-50 transform scale-110 shadow-md' : ''}
              ${isPast ? (isSuccess ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50') : ''}
              ${!isCurrent && !isPast ? 'border-slate-200 bg-slate-50 text-slate-400' : ''}
            `}
          >
            <span className={`text-xl font-bold ${isCurrent ? 'text-brand-600' : isPast ? (isSuccess ? 'text-emerald-600' : 'text-rose-600') : ''}`}>
              {char}
            </span>
            
            {/* Status Icon Indicator */}
            {isPast && (
              <div className={`absolute -bottom-2 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white
                ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}
              `}>
                {isSuccess ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
              </div>
            )}

            {isCurrent && (
              <div className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}

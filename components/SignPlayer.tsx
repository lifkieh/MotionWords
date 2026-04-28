'use client';

import { useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '@/data/alphabet';
import { useTranslation } from '@/app/components/LanguageContext';

interface SignPlayerProps {
  /** Array of image paths for frames */
  frames: string[];
  /** Interval in ms between frames */
  speed?: number;
  /** Start playing immediately */
  autoPlay?: boolean;
  /** Called when the sequence completes one full cycle */
  onComplete?: () => void;
  /** Show controls (play/pause/reset) */
  showControls?: boolean;
  /** Additional CSS class for the container */
  className?: string;
  /** Label to display (e.g. letter or system name) */
  label?: string;
}

export default function SignPlayer({
  frames,
  speed = 800,
  autoPlay = true,
  onComplete,
  showControls = true,
  className = '',
  label,
}: SignPlayerProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hasError, setHasError] = useState<Record<number, boolean>>({});

  // Reset when frames change
  useEffect(() => {
    setIndex(0);
    setIsPlaying(autoPlay);
    setHasError({});
  }, [frames, autoPlay]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= frames.length) {
          onComplete?.();
          return 0;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, frames, speed, onComplete]);

  const handleImageError = useCallback((frameIndex: number) => {
    setHasError((prev) => ({ ...prev, [frameIndex]: true }));
  }, []);

  const togglePlay = () => setIsPlaying((p) => !p);

  const reset = () => {
    setIndex(0);
    setIsPlaying(false);
  };

  if (frames.length === 0) return null;

  const currentSrc = hasError[index] ? PLACEHOLDER_IMAGE : frames[index];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Frame display */}
      <div className="relative w-full aspect-square max-w-[200px] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
        <img
          src={currentSrc}
          alt={label ? `${label} frame ${index + 1}` : `Sign frame ${index + 1}`}
          className="w-full h-full object-contain p-2"
          onError={() => handleImageError(index)}
        />

        {/* Frame counter badge */}
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">
          {index + 1}/{frames.length}
        </div>
      </div>

      {/* Label */}
      {label && (
        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{label}</span>
      )}

      {/* Controls */}
      {showControls && frames.length > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors shadow-md"
            title={isPlaying ? t('common.pause') : t('common.play')}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={reset}
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            title={t('common.reset')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
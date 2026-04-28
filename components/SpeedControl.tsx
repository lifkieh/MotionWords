'use client';

import { useTranslation } from '@/app/components/LanguageContext';

interface SpeedControlProps {
  /** Interval in ms between frames */
  speed: number;
  onChange: (speed: number) => void;
  min?: number;
  max?: number;
}

export default function SpeedControl({
  speed,
  onChange,
  min = 200,
  max = 3000,
}: SpeedControlProps) {
  const { t } = useTranslation();

  const getLabel = () => {
    if (speed <= 400) return t('speed.fast');
    if (speed <= 1000) return t('speed.normal');
    return t('speed.slow');
  };

  const getLabelColor = () => {
    if (speed <= 400) return 'text-emerald-600 dark:text-emerald-400';
    if (speed <= 1000) return 'text-brand-600 dark:text-brand-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('speed.label')}
        </label>
        <span className={`text-sm font-bold ${getLabelColor()}`}>
          {getLabel()} ({speed}ms)
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={100}
        value={speed}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{t('speed.fast')}</span>
        <span>{t('speed.slow')}</span>
      </div>
    </div>
  );
}

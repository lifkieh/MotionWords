'use client';

import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type SignSystem, SIGN_SYSTEM_MAP } from '@/data/signSystems';
import { getInsight, getInsightBadgeClasses, getInsightEmoji } from '@/data/compareInsights';
import { useTranslation } from '@/app/components/LanguageContext';

interface ComparisonPanelProps {
  activeSystems: SignSystem[];
  renderPanel: (system: SignSystem) => ReactNode;
  /** Current letter for insight badge display */
  currentLetter?: string;
  /** Show swipe navigation */
  showSwipe?: boolean;
  onSwipePrev?: () => void;
  onSwipeNext?: () => void;
  canSwipePrev?: boolean;
  canSwipeNext?: boolean;
}

export default function ComparisonPanel({
  activeSystems,
  renderPanel,
  currentLetter,
  showSwipe = false,
  onSwipePrev,
  onSwipeNext,
  canSwipePrev = true,
  canSwipeNext = true,
}: ComparisonPanelProps) {
  const { t, locale } = useTranslation();
  const count = activeSystems.length;

  // Get insight for current letter
  const insight = currentLetter ? getInsight(currentLetter, activeSystems) : null;

  // Grid layout class based on count
  const gridClass =
    count <= 1
      ? 'grid-cols-1'
      : count === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2'; // 3 and 4 both use 2-col grid

  return (
    <div className="space-y-3">
      {/* Insight Badge */}
      {insight && (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getInsightBadgeClasses(insight.type)}`}
        >
          <span>{getInsightEmoji(insight.type)}</span>
          <span>{locale === 'id' ? insight.id : insight.en}</span>
        </div>
      )}

      {/* Panel Grid */}
      <div className={`grid ${gridClass} gap-4`}>
        {activeSystems.map((sys) => {
          const meta = SIGN_SYSTEM_MAP[sys];
          return (
            <div
              key={sys}
              className={`rounded-2xl border-2 ${meta.borderColor} ${meta.bgLight} ${meta.bgDark} p-4 transition-all`}
            >
              {/* System label */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
                <span className={`text-sm font-bold ${meta.textColor}`}>
                  {locale === 'id' ? meta.nameId : meta.name}
                </span>
              </div>

              {/* Panel content */}
              <div className="flex items-center justify-center">
                {renderPanel(sys)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Swipe Navigation */}
      {showSwipe && count >= 2 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={onSwipePrev}
            disabled={!canSwipePrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('learn.swipePrev')}
          </button>
          <button
            onClick={onSwipeNext}
            disabled={!canSwipeNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t('learn.swipeNext')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

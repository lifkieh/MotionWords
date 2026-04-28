'use client';

import { type SignSystem, SIGN_SYSTEMS, SIGN_SYSTEM_MAP } from '@/data/signSystems';
import { useTranslation } from '@/app/components/LanguageContext';

interface SystemToggleProps {
  activeSystems: SignSystem[];
  onChange: (systems: SignSystem[]) => void;
}

export default function SystemToggle({ activeSystems, onChange }: SystemToggleProps) {
  const { locale } = useTranslation();

  const toggle = (key: SignSystem) => {
    if (activeSystems.includes(key)) {
      // Don't allow deactivating the last system
      if (activeSystems.length <= 1) return;
      onChange(activeSystems.filter((s) => s !== key));
    } else {
      onChange([...activeSystems, key]);
    }
  };

  const compareCount = activeSystems.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SIGN_SYSTEMS.map((sys) => {
          const isActive = activeSystems.includes(sys.key);
          return (
            <button
              key={sys.key}
              onClick={() => toggle(sys.key)}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                border-2 select-none
                ${isActive
                  ? `${sys.color} text-white border-transparent shadow-md scale-[1.02]`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-150 dark:hover:bg-slate-750'
                }
              `}
            >
              {locale === 'id' ? sys.nameId : sys.name}
            </button>
          );
        })}
      </div>

      {compareCount >= 2 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium border border-brand-200 dark:border-brand-800">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Compare {compareCount} systems
        </div>
      )}
    </div>
  );
}

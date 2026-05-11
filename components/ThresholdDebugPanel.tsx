import { SignSystem } from '@/data/signSystems';
import { getConfigForSystem } from '@/lib/handtracking/thresholdConfig';
import { useEffect, useState } from 'react';

interface ThresholdDebugPanelProps {
  system: SignSystem;
  debugInfo: { confidence: number; smoothCount: number; prediction: string } | null;
  currentLetter: string;
}

export default function ThresholdDebugPanel({ system, debugInfo, currentLetter }: ThresholdDebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hanya tampil jika env var di-set true (via process.env)
    if (process.env.NEXT_PUBLIC_DEBUG_THRESHOLD === 'true') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const config = getConfigForSystem(system);
  
  const conf = debugInfo?.confidence ?? 0;
  const isConfPassed = conf >= config.confidence;
  const smoothCount = debugInfo?.smoothCount ?? 0;
  const isSmoothPassed = smoothCount >= config.smoothingRequired;
  
  const isMatch = debugInfo?.prediction === currentLetter;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900/95 backdrop-blur shadow-2xl rounded-xl p-4 border-2 border-slate-700/50 w-72 text-white font-mono text-xs">
      <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
        <span className="font-bold text-amber-400">⚡ THRESHOLD DEBUG</span>
        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase">{system}</span>
      </div>

      <div className="space-y-3">
        {/* Prediction */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Predict:</span>
          <span className={`font-bold text-lg ${isMatch ? 'text-emerald-400' : 'text-slate-300'}`}>
            {debugInfo?.prediction || '-'}
          </span>
        </div>

        {/* Confidence */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-400">Conf:</span>
            <span className={isConfPassed ? 'text-emerald-400' : 'text-rose-400'}>
              {(conf * 100).toFixed(1)}% / {(config.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isConfPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, conf * 100)}%` }}
            />
          </div>
        </div>

        {/* Smoothing */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-400">Smooth:</span>
            <span className={isSmoothPassed ? 'text-emerald-400' : 'text-rose-400'}>
              {smoothCount} / {config.smoothingRequired} frames
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: config.smoothingWindow }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-sm ${i < smoothCount ? 'bg-blue-500' : 'bg-slate-800'}`}
              />
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between">
          <span className="text-slate-400">Status:</span>
          {isMatch && isConfPassed && isSmoothPassed ? (
            <span className="text-emerald-400 font-bold animate-pulse">HOLD (1.5s)</span>
          ) : (
            <span className="text-slate-500">Waiting...</span>
          )}
        </div>
      </div>
    </div>
  );
}

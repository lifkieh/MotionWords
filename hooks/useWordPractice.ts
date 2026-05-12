import { useState, useRef, useCallback, useEffect } from 'react';
import { matchGestureAuto } from '@/lib/handtracking/GestureMatcher';
import { HandFeatures } from '@/lib/handtracking/types';
import { TemporalSmoother } from '@/lib/handtracking/TemporalSmoother';
import { type SignSystem } from '@/data/signSystems';
import { getConfigForSystem } from '@/lib/handtracking/thresholdConfig';

type ResultState = 'Correct' | 'Incorrect' | 'Pending' | 'Holding';

export function useWordPractice(word: string, system: SignSystem) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<ResultState>('Pending');
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(new Array(word.length).fill(false));
  const [debugInfo, setDebugInfo] = useState<{ confidence: number; smoothCount: number; prediction: string } | null>(null);

  const currentLetter = word[currentIndex];
  const isFinished = currentIndex >= word.length;

  const config = getConfigForSystem(system, currentLetter);
  
  const smootherRef = useRef<TemporalSmoother | null>(null);
  
  // Re-initialize smoother when config changes
  useEffect(() => {
    smootherRef.current = new TemporalSmoother(
      config.smoothingWindow, 
      config.smoothingRequired / config.smoothingWindow
    );
  }, [config.smoothingWindow, config.smoothingRequired]);

  const confirmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  const lastMatchRef = useRef<{ timestamp: number; label: string } | null>(null);

  // Auto skip J and Z for all systems since they are dynamic gestures
  useEffect(() => {
    if (!currentLetter || isFinished) return;

    if (currentLetter === 'J' || currentLetter === 'Z') {
      const skipTimer = setTimeout(() => {
        setCompleted(prev => {
          const next = [...prev];
          next[currentIndex] = true;
          return next;
        });
        setResult('Correct');
        
        setTimeout(() => {
          setCurrentIndex(p => p + 1);
          setResult('Pending');
          if (smootherRef.current) smootherRef.current.reset();
        }, 1500);
      }, 500); // Short delay before skipping

      return () => clearTimeout(skipTimer);
    }
  }, [currentLetter, currentIndex, isFinished]);

  const processFeatures = useCallback(async (data: { features: HandFeatures; vector: number[] | null } | null) => {
    if (!data || isFinished) {
      if (isHoldingRef.current && !dropHoldTimerRef.current) {
        dropHoldTimerRef.current = setTimeout(() => {
          isHoldingRef.current = false;
          setResult('Pending');
          if (confirmTimerRef.current) { clearTimeout(confirmTimerRef.current); confirmTimerRef.current = null; }
          dropHoldTimerRef.current = null;
        }, 100);
      } else if (!isHoldingRef.current) {
        setResult('Pending');
        if (confirmTimerRef.current) {
          clearTimeout(confirmTimerRef.current);
          confirmTimerRef.current = null;
        }
      }
      return;
    }

    if (currentLetter === 'J' || currentLetter === 'Z') return;

    try {
      // Need a dummy templateFeatures for the unified matcher interface
      const dummyTemplate = { fingers: { thumb: { isExtended: false, curlAngle: 0 }, index: { isExtended: false, curlAngle: 0 }, middle: { isExtended: false, curlAngle: 0 }, ring: { isExtended: false, curlAngle: 0 }, pinky: { isExtended: false, curlAngle: 0 } } };
      
      const { label, confidence } = await matchGestureAuto({
        landmarks: data.vector,
        liveFeatures: data.features,
        templateFeatures: dummyTemplate,
        templateLabel: currentLetter,
        system,
        confidenceThreshold: config.confidence
      });
      if (!smootherRef.current) return;
      
      const smoothed = smootherRef.current.push(label, confidence);
      
      console.log('[DEBUG]', { 
        system, 
        currentLetter, 
        rawLabel: label, 
        confidence: confidence,
        smoothedLabel: smoothed?.label,
        smoothedConfidence: smoothed?.confidence,
        featuresSample: data.vector?.slice(0, 6),
        comparison: smoothed?.label?.toUpperCase() === currentLetter?.toUpperCase()
      });

      // Update debug info
      setDebugInfo({
        confidence: confidence,
        smoothCount: smoothed ? Math.round(smoothed.stability * config.smoothingWindow) : 0,
        prediction: label
      });

      if (!smoothed) {
        if (isHoldingRef.current && !dropHoldTimerRef.current) {
          dropHoldTimerRef.current = setTimeout(() => {
            isHoldingRef.current = false;
            setResult('Pending');
            if (confirmTimerRef.current) { clearTimeout(confirmTimerRef.current); confirmTimerRef.current = null; }
            dropHoldTimerRef.current = null;
          }, 100);
        } else if (!isHoldingRef.current) {
          setResult('Pending');
          if (confirmTimerRef.current) { clearTimeout(confirmTimerRef.current); confirmTimerRef.current = null; }
        }
        return;
      }

      if (smoothed.label.toUpperCase() === currentLetter.toUpperCase() && smoothed.confidence >= 0.82) {
        if (dropHoldTimerRef.current) {
          clearTimeout(dropHoldTimerRef.current);
          dropHoldTimerRef.current = null;
        }

        if (!isHoldingRef.current && !confirmTimerRef.current) {
          isHoldingRef.current = true;
          setResult('Holding'); // Berubah hijau secara instan
          confirmTimerRef.current = setTimeout(() => {
            isHoldingRef.current = false;
            setResult('Correct');
            setCompleted((prev) => {
              const next = [...prev];
              next[currentIndex] = true;
              return next;
            });

            setTimeout(() => {
              setCurrentIndex((p) => p + 1);
              setResult('Pending');
              smootherRef.current?.reset();
            }, 1000);
          }, config.holdDurationMs);
        }
      } else {
        if (isHoldingRef.current && !dropHoldTimerRef.current) {
          dropHoldTimerRef.current = setTimeout(() => {
            isHoldingRef.current = false;
            setResult('Pending');
            if (confirmTimerRef.current) { clearTimeout(confirmTimerRef.current); confirmTimerRef.current = null; }
            dropHoldTimerRef.current = null;
          }, 100);
        } else if (!isHoldingRef.current) {
          setResult('Pending');
          if (confirmTimerRef.current) {
            clearTimeout(confirmTimerRef.current);
            confirmTimerRef.current = null;
          }

          const now = Date.now();
          if (smoothed.label && smoothed.label.toUpperCase() !== currentLetter.toUpperCase()) {
            if (!lastMatchRef.current || (now - lastMatchRef.current.timestamp > 2000)) {
              setAttempts((p) => p + 1);
              lastMatchRef.current = { timestamp: now, label: smoothed.label };
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setResult('Pending');
      isHoldingRef.current = false;
    }
  }, [currentLetter, isFinished, currentIndex, system, config.confidence, config.holdDurationMs]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setResult('Pending');
    setAttempts(0);
    setCompleted(new Array(word.length).fill(false));
    isHoldingRef.current = false;
    if (smootherRef.current) smootherRef.current.reset();
  }, [word]);

  const skip = useCallback(() => {
    if (isFinished) return;
    setCompleted(prev => {
      const next = [...prev];
      next[currentIndex] = false;
      return next;
    });
    setCurrentIndex(p => p + 1);
    setResult('Pending');
    isHoldingRef.current = false;
    if (smootherRef.current) smootherRef.current.reset();
  }, [currentIndex, isFinished]);

  return {
    currentIndex,
    currentLetter,
    result,
    attempts,
    completed,
    processFeatures,
    reset,
    skip,
    isFinished,
    debugInfo
  };
}
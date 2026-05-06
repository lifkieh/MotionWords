import { useState, useRef, useCallback, useEffect } from 'react';
import { HandFeatures } from '@/lib/handtracking/types';
import { matchGestureAuto, isModelReady } from '@/lib/handtracking/GestureMatcher';
import { templates } from '@/lib/handtracking/templates';

export type PracticeResult = "Waiting" | "Correct" | "Not Correct" | "Loading";

export interface ProcessInput {
  features: HandFeatures;
  vector: number[] | null;
}

export function useWordPractice(word: string, signSystem: string) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [result, setResult] = useState<PracticeResult>("Waiting");
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [modelReady, setModelReady] = useState(false);

  const bufferRef = useRef<boolean[]>([]);
  const holdStartRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  // ── Reset saat word berubah (FIX: pakai useEffect) ────────────────────────
  useEffect(() => {
    setCurrentIndex(0);
    setAttempts(1);
    setResult("Waiting");
    setCompleted(new Array(word.length).fill(false));

    bufferRef.current = [];
    holdStartRef.current = null;
    isProcessingRef.current = false;
  }, [word]);

  // ── Load model ────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    setModelReady(false);
    setResult("Loading");

    bufferRef.current = [];
    holdStartRef.current = null;

    isModelReady(signSystem).then((ready) => {
      if (!isMounted) return;

      setModelReady(ready);
      setResult("Waiting");

      if (!ready) {
        console.warn(`[useWordPractice] Model ${signSystem} belum tersedia`);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [signSystem]);

  // ── Timer attempts ────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentIndex >= word.length) return;

    const timer = setInterval(() => {
      setAttempts(prev => prev + 1);
    }, 6000);

    return () => clearInterval(timer);
  }, [currentIndex, word.length]);

  // ── Reset manual ──────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAttempts(1);
    setResult("Waiting");
    setCompleted(new Array(word.length).fill(false));

    bufferRef.current = [];
    holdStartRef.current = null;
    isProcessingRef.current = false;
  }, [word]);

  // ── Skip ──────────────────────────────────────────────────────────────────
  const skip = useCallback(() => {
    if (currentIndex >= word.length) return;

    setCompleted(prev => {
      const next = [...prev];
      next[currentIndex] = false;
      return next;
    });

    setCurrentIndex(p => p + 1);
    setAttempts(1);
    setResult("Waiting");

    bufferRef.current = [];
    holdStartRef.current = null;
    isProcessingRef.current = false;
  }, [currentIndex, word.length]);

  // ── Process frame ─────────────────────────────────────────────────────────
  const processFeatures = useCallback(async (input: ProcessInput | null) => {
    if (currentIndex >= word.length) return;
    if (isProcessingRef.current) return;

    // model belum ready
    if (!modelReady) {
      setResult("Loading");
      return;
    }

    if (!input) {
      setResult("Waiting");
      holdStartRef.current = null;
      return;
    }

    const currentLetter = word[currentIndex].toUpperCase();

    // skip dynamic gesture
    if (currentLetter === 'J' || currentLetter === 'Z') {
      setResult("Waiting");
      return;
    }

    const template = templates[currentLetter];
    if (!template) {
      setResult("Not Correct");
      return;
    }

    isProcessingRef.current = true;

    let isMatch = false;

    try {
      const matchResult = await matchGestureAuto({
        landmarks: input.vector,
        liveFeatures: input.features,
        templateFeatures: template,
        templateLabel: currentLetter,
        system: signSystem,
        confidenceThreshold: 0.6,
      });

      isMatch = matchResult.isMatch;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Practice] ${signSystem} | ${currentLetter} | ${matchResult.label} | ${(matchResult.confidence * 100).toFixed(0)}% | ${matchResult.source} | match=${isMatch}`
        );
      }

    } catch (e) {
      console.error('[GestureMatcher] error:', e);
      isProcessingRef.current = false;
      return;
    }

    isProcessingRef.current = false;

    // ── smoothing ─────────────────────────────────────────────────────────
    bufferRef.current.push(isMatch);
    if (bufferRef.current.length > 5) bufferRef.current.shift();

    const trueCount = bufferRef.current.filter(Boolean).length;
    const smoothedMatch = trueCount >= 3;

    if (smoothedMatch) {
      setResult("Correct");

      if (!holdStartRef.current) {
        holdStartRef.current = Date.now();
      } else if (Date.now() - holdStartRef.current >= 1500) {
        setCompleted(prev => {
          const next = [...prev];
          next[currentIndex] = true;
          return next;
        });

        setCurrentIndex(p => p + 1);
        setAttempts(1);
        setResult("Waiting");

        bufferRef.current = [];
        holdStartRef.current = null;
      }

    } else {
      setResult("Not Correct");
      holdStartRef.current = null;
    }

  }, [currentIndex, word, signSystem, modelReady]);

  return {
    currentIndex,
    currentLetter: word[currentIndex],
    result,
    attempts,
    completed,
    processFeatures,
    reset,
    skip,
    isFinished: currentIndex >= word.length,
    modelReady,
  };
}
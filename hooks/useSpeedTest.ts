'use client';

import { useCallback, useRef } from 'react';
import { runSpeedTest } from '@/lib/speed-test';
import { useSpeedTestStore } from '@/store/speedTestStore';

export function useSpeedTest() {
  const {
    isRunning,
    result,
    progress,
    error,
    setIsRunning,
    setResult,
    setProgress,
    setError,
  } = useSpeedTestStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const startTest = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setError(null);
    setProgress({ phase: 'ping', progress: 0, message: 'Starting test...' });

    abortControllerRef.current = new AbortController();

    try {
      const testResult = await runSpeedTest((progressUpdate) => setProgress(progressUpdate));
      setResult(testResult);
      setIsRunning(false);
      setProgress({
        phase: 'complete',
        progress: 100,
        message: 'Test complete!',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test failed';
      setError(errorMessage);
      setIsRunning(false);
      setProgress({
        phase: 'idle',
        progress: 0,
        message: 'Test failed',
      });
    } finally {
      abortControllerRef.current = null;
    }
  }, [isRunning, setIsRunning, setError, setProgress, setResult]);

  const stopTest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setProgress({
      phase: 'idle',
      progress: 0,
      message: 'Test stopped',
    });
  }, [setIsRunning, setProgress]);

  return {
    isRunning,
    result,
    progress,
    error,
    startTest,
    stopTest,
  };
}

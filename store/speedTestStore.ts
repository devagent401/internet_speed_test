import { create } from 'zustand';
import { SpeedTestResult, SpeedTestProgress } from '@/lib/speed-test';

interface SpeedTestState {
    isRunning: boolean;
    result: SpeedTestResult | null;
    progress: SpeedTestProgress;
    error: string | null;

    // Actions
    setIsRunning: (isRunning: boolean) => void;
    setResult: (result: SpeedTestResult | null) => void;
    setProgress: (progress: SpeedTestProgress) => void;
    setError: (error: string | null) => void;
}

const initialState = {
    isRunning: false,
    result: null as SpeedTestResult | null,
    progress: {
        phase: 'idle' as const,
        progress: 0,
        message: 'Ready to test',
    },
    error: null as string | null,
};

export const useSpeedTestStore = create<SpeedTestState>((set) => ({
    ...initialState,

    setIsRunning: (isRunning: boolean) => set({ isRunning }),
    setResult: (result: SpeedTestResult | null) => set({ result }),
    setProgress: (progress: SpeedTestProgress) => set({ progress }),
    setError: (error: string | null) => set({ error }),
}));

'use client';

import { useSpeedTest } from '@/hooks/useSpeedTest';
import SpeedMeter from '@/components/SpeedMeter';
import ProgressBar from '@/components/ProgressBar';
import TestButton from '@/components/TestButton';
import { motion } from 'framer-motion';

export default function Home() {
  const {
    isRunning,
    result,
    progress,
    error,
    startTest,
    stopTest,
  } = useSpeedTest();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">
              Internet Speed Test
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time internet speed measurement
            </p>
          </motion.div>
        </header>

        {/* Main Speed Test Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200"
        >
          {/* Speed Meters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <SpeedMeter
                value={result?.download || 0}
                maxValue={1000}
                label="Download Speed"
                unit="Mbps"
                size={220}
              />
            </div>
            <div className="flex flex-col items-center">
              <SpeedMeter
                value={result?.upload || 0}
                maxValue={500}
                label="Upload Speed"
                unit="Mbps"
                size={220}
              />
            </div>
          </div>

          {/* Ping and Jitter */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">
                Ping
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {result?.ping.toFixed(1) || '--'} ms
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">
                Jitter
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {result?.jitter.toFixed(1) || '--'} ms
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <ProgressBar
                progress={progress.progress}
                height={12}
                showLabel
                label={progress.message}
              />
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-800">{error}</p>
            </motion.div>
          )}

          {/* Test Button */}
          <div className="flex justify-center">
            <TestButton
              onClick={isRunning ? stopTest : startTest}
              isRunning={isRunning}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

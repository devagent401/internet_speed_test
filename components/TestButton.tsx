'use client';

import { motion } from 'framer-motion';

interface TestButtonProps {
  onClick: () => void;
  isRunning: boolean;
  disabled?: boolean;
}

export default function TestButton({
  onClick,
  isRunning,
  disabled = false,
}: TestButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isRunning}
      className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-blue-400 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[200px]"
      whileHover={!disabled && !isRunning ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isRunning ? { scale: 0.95 } : {}}
      aria-label={isRunning ? 'Stop test' : 'Start speed test'}
    >
      {isRunning ? (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span>Testing...</span>
        </div>
      ) : (
        <span>Start Test</span>
      )}
    </motion.button>
  );
}


'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({
  progress,
  color,
  height = 8,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Determine color based on progress if not provided
  const getColor = () => {
    if (color) return color;
    if (clampedProgress < 33) return '#ef4444'; // red
    if (clampedProgress < 66) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  const barColor = getColor();

  return (
    <div className="w-full">
      {showLabel && label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {label}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {clampedProgress.toFixed(0)}%
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800"
        style={{ height }}
      >
        <motion.div
          className="rounded-full"
          style={{
            backgroundColor: barColor,
            height: '100%',
            boxShadow: `0 0 12px ${barColor}40`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}


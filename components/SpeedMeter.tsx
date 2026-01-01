'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SpeedMeterProps {
  value: number; // Speed in Mbps
  maxValue?: number; // Maximum value for gauge (default: 1000)
  label: string;
  unit?: string;
  size?: number; // Size in pixels
  color?: string;
}

export default function SpeedMeter({
  value,
  maxValue = 1000,
  label,
  unit = 'Mbps',
  size = 200,
  color,
}: SpeedMeterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  // Determine color based on speed if not provided
  const getColor = () => {
    if (color) return color;
    if (percentage < 33) return '#ef4444'; // red
    if (percentage < 66) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  const meterColor = getColor();

  // Animate value
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayValue(stepValue * currentStep);
      } else {
        setDisplayValue(value);
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-gray-200 opacity-30"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={meterColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 8px ${meterColor}40)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="text-3xl font-bold tabular-nums"
            style={{ color: meterColor }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {displayValue.toFixed(1)}
          </motion.div>
          <div className="text-xs text-gray-500 mt-1">
            {unit}
          </div>
        </div>
      </div>
      <div className="text-sm font-medium text-gray-700">
        {label}
      </div>
    </div>
  );
}


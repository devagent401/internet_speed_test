'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface SpeedCounterProps {
    value: number;
    unit?: string;
    decimals?: number;
    className?: string;
    color?: string;
}

export default function SpeedCounter({
    value,
    unit = 'Mbps',
    decimals = 1,
    className = '',
    color,
}: SpeedCounterProps) {

    const spring = useSpring(0, {
        stiffness: 50,
        damping: 30,
    });

    const display = useTransform(spring, (current: number) =>
        Math.max(0, current).toFixed(decimals)
    );

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    const getColor = () => {
        if (color) return color;
        return 'inherit';
    };

    return (
        <motion.div
            className={`tabular-nums ${className}`}
            style={{ color: getColor() }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <span className="text-4xl font-bold">{display.get()}</span>
            <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">
                {unit}
            </span>
        </motion.div>
    );
}


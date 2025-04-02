import React from 'react';
import { motion } from 'framer-motion';
import './ProgressBar.scss';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 6,
  color = 'primary',
  className = '',
  animated = true,
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={`progress-bar ${className}`}
      style={{ height: `${height}px` }}
    >
      <motion.div
        className={`progress-bar__fill progress-bar__fill--${color}`}
        initial={{ width: '0%' }}
        animate={{ width: `${normalizedProgress}%` }}
        transition={{
          duration: animated ? 0.3 : 0,
          ease: 'easeOut'
        }}
      />

      {animated && (
        <div className="progress-bar__pulse" style={{ left: `${normalizedProgress}%` }} />
      )}
    </div>
  );
};

export default ProgressBar;
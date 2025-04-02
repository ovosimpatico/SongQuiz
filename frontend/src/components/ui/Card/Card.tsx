import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import './Card.scss';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  // Motion component props
  const motionProps: HTMLMotionProps<"div"> = {
    whileHover: onClick ? { scale: 1.01 } : undefined,
    whileTap: onClick ? { scale: 0.99 } : undefined,
    transition: { duration: 0.1 }
  };

  return (
    <motion.div
      className={`card ${className}`}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default Card;
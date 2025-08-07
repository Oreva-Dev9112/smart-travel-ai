'use client';

import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo = ({ size = 'medium', className = '' }: LogoProps) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizes = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center space-x-2 ${className}`}
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className={`${sizeClasses[size]} rounded-full bg-luxury-gold/10 flex items-center justify-center`}
      >
        <SparklesIcon className={`${sizeClasses[size]} text-luxury-gold`} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className={`font-playfair text-luxury-gold ${textSizes[size]}`}>
          Smart Travel
        </h3>
        <p className={`text-luxury-beige/80 ${textSizes[size]}`}>
          Planner
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Logo; 
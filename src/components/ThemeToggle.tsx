'use client';

import { useTheme } from '@/lib/ThemeContext';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Get theme context - moved to top before any conditionals
  const { theme, toggleTheme, isDark } = useTheme();
  
  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="h-10 w-10" aria-hidden="true"></div>;
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={() => {
        toggleTheme();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-10 w-10 rounded-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A37A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F1C1C] transition-all duration-300"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background */}
      <div className={`absolute inset-0 rounded-full ${
        isDark 
          ? 'bg-[#0F0E0E] border border-[#C9A37A]/30' 
          : 'bg-[#F5F5F5] border border-[#C9A37A]'
      } transition-colors duration-500`} />
      
      {/* Sun Icon */}
      <motion.div
        initial={{ scale: isDark ? 0.5 : 1, opacity: isDark ? 0 : 1 }}
        animate={{ 
          scale: isDark ? 0.5 : 1, 
          opacity: isDark ? 0 : 1,
          rotate: isHovered && !isDark ? 180 : 0 
        }}
        transition={{ duration: 0.5 }}
        className="absolute"
      >
        <Sun size={20} className={`${isDark ? 'text-[#F5F5F5]/0' : 'text-[#C9A37A]'} transition-colors duration-500`} />
      </motion.div>
      
      {/* Moon Icon */}
      <motion.div
        initial={{ scale: isDark ? 1 : 0.5, opacity: isDark ? 1 : 0 }}
        animate={{ 
          scale: isDark ? 1 : 0.5, 
          opacity: isDark ? 1 : 0,
          rotate: isHovered && isDark ? 180 : 0 
        }}
        transition={{ duration: 0.5 }}
        className="absolute"
      >
        <Moon size={20} className={`${isDark ? 'text-[#C9A37A]' : 'text-[#F5F5F5]/0'} transition-colors duration-500`} />
      </motion.div>
      
      {/* Stars */}
      {isDark && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#C9A37A]/80 rounded-full"
              initial={{ 
                x: (Math.random() - 0.5) * 20, 
                y: (Math.random() - 0.5) * 20,
                opacity: 0
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{ 
                duration: 1 + Math.random() * 2, 
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </>
      )}
    </motion.button>
  );
} 
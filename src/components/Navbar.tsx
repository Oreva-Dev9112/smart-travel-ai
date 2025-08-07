'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, MessageCircle, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useKeyboardNavigation, useFocusTrap } from '@/lib/hooks';

const navItems = [
  { name: 'Homepage', href: '/', icon: <Home className="w-4 h-4" /> },
  { name: 'Search', href: '/search', icon: <Search className="w-4 h-4" /> },
  { name: 'Chat Assistant', href: '/assistant', icon: <MessageCircle className="w-4 h-4" /> }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navRefs = useRef(navItems.map(() => useRef<HTMLAnchorElement>(null)));
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // Keyboard navigation for desktop nav items
  const { handleKeyDown } = useKeyboardNavigation(
    navRefs.current,
    { horizontal: true, loop: true }
  );
  
  // Focus trap for mobile menu
  useFocusTrap(mobileMenuRef, isMobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Lock body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when escape key is pressed
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isMobileMenuOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-4xl mt-5"
      >
        <nav
          className={`
            flex items-center justify-between
            px-5 py-3 mx-auto
            rounded-xl backdrop-blur-md
            transition-all duration-300
            ${isScrolled 
              ? 'bg-[#111010]/95 dark:bg-[#111010]/95 shadow-[0_8px_32px_-4px_rgba(201,163,122,0.2)] border border-[#C9A37A]/10' 
              : 'bg-[#0F0E0E]/90 dark:bg-[#050505]/90 border border-[#C9A37A]/5'
            }
          `}
          role="navigation"
          aria-label="Main Navigation"
        >
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2.5 group"
            aria-label="Smart Travel - Go to homepage"
          >
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#C9A37A] to-[#94754E] flex items-center justify-center overflow-hidden">
              <span className="text-[#0F0E0E] font-semibold text-sm relative z-10">ST</span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-[#C9A37A] via-[#B18E6B] to-[#94754E]"
                initial={false}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#C9A37A] via-[#F5F5F5] to-[#C9A37A]">
              Smart Travel
            </span>
          </Link>

          {/* Desktop Navigation Items */}
          <div 
            className="hidden md:flex items-center space-x-2"
            role="menubar"
            onKeyDown={handleKeyDown}
          >
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                ref={navRefs.current[i]}
                role="menuitem"
                tabIndex={0}
                className="group relative flex items-center space-x-1.5 px-3.5 py-2 text-[#F5F5F5] dark:text-[#F5F5F5]/80 hover:text-[#F5F5F5] dark:hover:text-[#F5F5F5] transition-colors duration-200"
                aria-label={item.name}
              >
                <span className="relative z-10 transition-transform duration-200 group-hover:scale-110 group-focus:scale-110">
                  {item.icon}
                </span>
                <span className="relative z-10 text-sm font-medium">{item.name}</span>
                <div className="absolute inset-0 bg-[#C9A37A]/10 dark:bg-[#C9A37A]/5 rounded-lg scale-0 group-hover:scale-100 group-focus:scale-100 transition-transform duration-200" />
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            
            <button 
              className="relative p-2 rounded-lg hover:bg-[#C9A37A]/10 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="space-y-1">
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-[#C9A37A]" />
                ) : (
                  <>
                    <motion.div 
                      className="w-4 h-0.5 bg-[#C9A37A]"
                      initial={false}
                      animate={{ width: "16px" }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div 
                      className="w-3 h-0.5 bg-[#C9A37A]"
                      initial={false}
                      animate={{ width: "12px" }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div 
                      className="w-2 h-0.5 bg-[#C9A37A]"
                      initial={false}
                      animate={{ width: "8px" }}
                      transition={{ duration: 0.2 }}
                    />
                  </>
                )}
              </div>
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute left-0 right-0 mt-2 py-4 px-4 rounded-xl bg-[#111010]/95 dark:bg-[#111010]/95 shadow-[0_8px_32px_-4px_rgba(201,163,122,0.2)] border border-[#C9A37A]/10 backdrop-blur-md"
            role="menu"
          >
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-[#F5F5F5] hover:bg-[#C9A37A]/10 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
                role="menuitem"
              >
                <span className="text-[#C9A37A]">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
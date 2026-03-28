import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import { useTheme } from '../content/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Prevent scrolling when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Track scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track viewport width for mobile glassmorphism
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const navLinks = [
    { name: 'About', path: '#about' },
    { name: 'Experience', path: '#experience' },
    { name: 'Projects', path: '#projects' },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 rounded-2xl mx-4 mt-2 shadow-lg max-w-[calc(100%-2rem)] md:max-w-6xl md:mx-auto backdrop-blur-md ${
      scrolled
        ? 'border border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-[oklch(0.13_0.028_261.692)]/80' 
        : 'bg-white dark:bg-[oklch(0.13_0.028_261.692)]'
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Spacer for mobile to help with centering - hidden on desktop */}
        <div className="w-10 md:hidden" />

        {/* Logo - centered on mobile, left on desktop */}
        <a href="#home" className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded" aria-label="JDG Portfolio Home">
          {/* Mobile: gradient icon with glow */}
          <div className="flex md:hidden h-8 w-8 items-center justify-center rounded bg-linear-to-br from-blue-500 to-blue-700 text-white font-mono font-bold text-xs group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all duration-200">
            {"</>"}
          </div>
          {/* Desktop: larger gradient icon with glow */}
          <div className="hidden md:flex h-10 w-10 items-center justify-center rounded bg-linear-to-br from-blue-500 to-blue-700 text-white font-mono font-bold text-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all duration-200">
            {"</>"}
          </div>
          <span className="sm:inline text-lg font-bold tracking-tight dark:text-white">JDG</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.path} 
              className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {link.name}
            </a>
          ))}
          
          <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-2 lg:mx-3" />

          <button 
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <a 
            href="#contact" 
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Contact
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <div className="w-10 md:hidden flex items-center justify-end gap-2 sm:gap-3">
           <button 
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            className="p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-4 top-20 z-50 w-[calc(100%-2rem)] sm:w-1/2 max-w-sm rounded-2xl bg-white/95 dark:bg-[#0d141f]/95 border border-gray-200 dark:border-white/10 shadow-2xl backdrop-blur-xl md:hidden flex flex-col p-5"
            >
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.path} 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {link.name}
                    <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
                
                <div className="my-3 border-t border-gray-100 dark:border-white/5" />
                
                <a 
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-lg shadow-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Get in Touch
                </a>
              </nav>
              
              <div className="mt-auto pt-4 text-center">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">© 2026 JDG</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

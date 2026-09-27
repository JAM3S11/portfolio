import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../content/ThemeProvider';

const ThemeToggle = ({ size = 18, className = '' }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDarkMode ? 'sun' : 'moon'}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          {isDarkMode ? <Sun size={size} /> : <Moon size={size} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;

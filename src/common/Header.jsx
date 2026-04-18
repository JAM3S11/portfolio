import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useScroll, useViewport, useBodyScrollLock, useScrollProgress } from '../hooks';
import { Logo, DesktopNav, MobileNav, ThemeToggle } from './components';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const scrolled = useScroll(20);
  const scrollProgress = useScrollProgress();
  const isDesktop = useViewport(768);

  useBodyScrollLock(isOpen);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu if switching to desktop
  React.useEffect(() => {
    if (isDesktop && isOpen) {
      setIsOpen(false);
    }
  }, [isDesktop, isOpen]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-header-bg-scrolled backdrop-blur-md border-b border-border shadow-sm" 
          : "bg-background border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Logo />
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-4">
            {/* Desktop Nav */}
            <DesktopNav />

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle size={20} />
              <button
                onClick={toggleMenu}
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isOpen}
                className="p-2 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Scroll Progress Bar - Pinned to bottom border */}
          <motion.div 
            className="absolute -bottom-[1px] left-0 h-[1px] bg-brand z-50 origin-left"
            style={{ scaleX: scrollProgress / 100 }}
          />
        </div>
      </div>

      <MobileNav isOpen={isOpen} onClose={closeMenu} />
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { Github, FileText, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useScroll, useViewport, useBodyScrollLock, useScrollProgress, useActiveSection } from '../hooks';
import { Logo, DesktopNav, MobileNav, ThemeToggle } from './components';

const sectionIds = ['home', 'about', 'experience', 'projects', 'contact'];

// Two-line hamburger that morphs into an X
const MenuIcon = ({ isOpen }) => (
  <span className="relative block h-3.5 w-5">
    <motion.span
      animate={isOpen ? { top: '50%', rotate: 45, y: '-50%' } : { top: '15%', rotate: 0, y: '-50%' }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 h-0.5 w-full rounded-full bg-current"
    />
    <motion.span
      animate={isOpen ? { top: '50%', rotate: -45, y: '-50%' } : { top: '85%', rotate: 0, y: '-50%' }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 h-0.5 w-full rounded-full bg-current"
    />
  </span>
);

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScroll(20);
  const scrollProgress = useScrollProgress();
  const isDesktop = useViewport(768);
  const active = useActiveSection(sectionIds);

  // Menu only exists on mobile, so it's closed whenever the viewport is desktop-sized
  const isOpen = menuOpen && !isDesktop;

  useBodyScrollLock(isOpen);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  // Close menu on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const floating = scrolled || isOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-4 pt-3">
      {/* Scroll progress, pinned to the top edge of the viewport */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-brand origin-left"
        style={{ scaleX: scrollProgress / 100 }}
      />

      <div
        className={cn(
          'relative mx-auto transition-[max-width] duration-500 ease-out',
          floating ? 'max-w-5xl' : 'max-w-7xl'
        )}
      >
        <div
          className={cn(
            'grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center h-14 pl-3 pr-2 rounded-full border transition-all duration-500',
            floating
              ? 'bg-header-bg-scrolled backdrop-blur-xl border-border shadow-lg shadow-black/5 dark:shadow-black/30'
              : 'bg-transparent border-transparent'
          )}
        >
          <div className="flex items-center">
            <Logo />
          </div>

          <DesktopNav active={active} />

          {/* Actions */}
          <div className="flex items-center justify-end gap-1">
            <a
              href={import.meta.env.VITE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Github size={18} />
            </a>
            <ThemeToggle />

            <div className="hidden md:block mx-1.5 h-5 w-px bg-border" />

            <a
              href="/JAMES_DANIEL_CV.pdf"
              download="James_Daniel_CV.pdf"
              className="hidden lg:flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <FileText size={15} />
              Resume
            </a>
            <a
              href="#contact"
              className="group hidden md:flex items-center gap-1 h-9 pl-4 pr-3 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-brand hover:text-white transition-colors active:scale-95"
            >
              Let's talk
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
            >
              <MenuIcon isOpen={isOpen} />
            </button>
          </div>
        </div>

        <MobileNav isOpen={isOpen} onClose={closeMenu} active={active} />
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useScroll, useViewport, useBodyScrollLock } from '../hooks';
import { Logo, DesktopNav, MobileNav, ThemeToggle } from './components';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const scrolled = useScroll(10);
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
    <header className="fixed top-4 inset-x-4 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div
          className={cn(
            "backdrop-blur-md border rounded-2xl shadow-lg shadow-black/5 transition-all duration-300 px-4 sm:px-6",
            scrolled
              ? "bg-white/80 dark:bg-[#111b22]/90 border-gray-200/50 dark:border-[#233948]/50"
              : "bg-white/70 dark:bg-[#111b22]/80 border-gray-200/50 dark:border-[#233948]/50"
          )}
        >
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <Logo />
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center gap-4">
              {/* Desktop Nav (includes links, divider, toggle, and button) */}
              <DesktopNav />

              {/* Mobile Controls */}
              <div className="flex md:hidden items-center gap-2">
                <ThemeToggle size={20} />
                <button
                  onClick={toggleMenu}
                  aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={isOpen}
                  className="p-2 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileNav isOpen={isOpen} onClose={closeMenu} />
    </header>
  );
};

export default Header;

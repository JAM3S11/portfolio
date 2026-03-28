import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks } from './DesktopNav';

export const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const MobileNav = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 top-[72px] z-40 bg-black/10 backdrop-blur-[2px] md:hidden"
            aria-hidden="true"
          />

          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-4 top-[88px] z-50 w-[calc(100%-2rem)] sm:w-1/2 max-w-sm rounded-2xl bg-white/95 dark:bg-[#111b22]/95 border border-gray-200 dark:border-[#233948] shadow-2xl backdrop-blur-sm md:hidden flex flex-col p-5"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {link.name}
                  <ArrowRight
                    size={16}
                    className="opacity-50 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              ))}

              <div className="my-3 border-t border-gray-100 dark:border-white/5" />

              <a
                href="#contact"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-lg shadow-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get in Touch
              </a>
            </nav>

            <div className="mt-auto pt-4 text-center">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                © 2026 JDG
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;

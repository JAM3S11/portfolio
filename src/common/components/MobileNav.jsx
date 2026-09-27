import React from 'react';
import { ArrowRight, ArrowUpRight, Github, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks } from './DesktopNav';
import { cn } from '../../lib/utils';

export const mobileMenuVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 30, staggerChildren: 0.04 },
  },
  exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.15 } },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0 },
};

const MobileNav = ({ isOpen, onClose, active }) => {
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
            className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />

          <motion.div
            id="mobile-nav"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 right-0 top-full mt-2 origin-top rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl p-2 md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {navLinks.map((link) => {
                const isActive = active === link.path.slice(1);
                return (
                  <motion.a
                    key={link.name}
                    variants={itemVariants}
                    href={link.path}
                    onClick={onClose}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'group flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    {link.name}
                    <ArrowRight
                      size={16}
                      className="opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                    />
                  </motion.a>
                );
              })}
            </nav>

            <div className="my-2 h-px bg-border" />

            <motion.div variants={itemVariants} className="flex items-center gap-2 p-2">
              <a
                href="#contact"
                onClick={onClose}
                className="flex grow items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-blue-600 active:scale-[0.98] transition-all"
              >
                Let's talk
                <ArrowUpRight size={16} />
              </a>
              <a
                href={import.meta.env.VITE_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground"
              >
                <Github size={18} />
              </a>
              <a
                href={import.meta.env.VITE_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground"
              >
                <Linkedin size={18} />
              </a>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;

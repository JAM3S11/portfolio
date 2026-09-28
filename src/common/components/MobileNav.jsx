import React from 'react';
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks } from './DesktopNav';
import { cn } from '../../lib/utils';

export const mobileMenuVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 30, staggerChildren: 0.04, delayChildren: 0.04 },
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

const menuLinks = [...navLinks, { name: 'Contact', path: '#contact' }];

const socials = [
  { name: 'GitHub', icon: Github, url: import.meta.env.VITE_GITHUB_URL },
  { name: 'LinkedIn', icon: Linkedin, url: import.meta.env.VITE_LINKEDIN_URL },
  { name: 'Email', icon: Mail, url: 'mailto:jdndirangu2020@gmail.com' },
];

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
            className="fixed inset-0 -z-10 bg-black/30 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />

          <motion.div
            id="mobile-nav"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 right-0 top-full mt-2 origin-top max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl p-2 md:hidden"
          >
            {/* Section links */}
            <nav aria-label="Mobile" className="flex flex-col">
              {menuLinks.map((link, i) => {
                const isActive = active === link.path.slice(1);
                return (
                  <motion.a
                    key={link.name}
                    variants={itemVariants}
                    href={link.path}
                    onClick={onClose}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'group flex min-h-[52px] items-center justify-between rounded-2xl px-4 text-lg font-medium transition-colors active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-brand',
                      isActive ? 'bg-muted text-foreground' : 'text-muted-foreground active:bg-muted/60'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground/70">0{i + 1}</span>
                      {link.name}
                    </span>
                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(59,130,246,0.7)]" />
                    ) : (
                      <ArrowRight size={16} className="opacity-40" />
                    )}
                  </motion.a>
                );
              })}
            </nav>

            <div className="mx-2 my-2 h-px bg-border" />

            {/* Resume */}
            <motion.a
              variants={itemVariants}
              href="/JAMES_DANIEL_CV.pdf"
              download="James_Daniel_CV.pdf"
              onClick={onClose}
              className="flex min-h-[52px] items-center justify-between rounded-2xl px-4 text-base font-medium text-foreground active:bg-muted/60 transition-colors"
            >
              <span className="flex items-center gap-3">
                <FileText size={18} className="text-muted-foreground" />
                Download resume
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">PDF</span>
            </motion.a>

            {/* CTA + socials */}
            <motion.div variants={itemVariants} className="flex items-center gap-2 p-2 pt-3">
              <a
                href="#contact"
                onClick={onClose}
                className="flex h-12 grow items-center justify-center gap-2 rounded-2xl bg-foreground text-sm font-semibold text-background active:scale-[0.98] transition-transform"
              >
                Let's talk
                <ArrowUpRight size={16} />
              </a>
              {socials.map(({ name, icon: Icon, url }) => (
                <a
                  key={name}
                  href={url}
                  target={url?.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border text-muted-foreground active:bg-muted transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </motion.div>

            <p className="flex items-center justify-center gap-2 pb-2 pt-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Available for new work
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;

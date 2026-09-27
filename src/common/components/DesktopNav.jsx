import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const navLinks = [
  { name: 'About', path: '#about' },
  { name: 'Experience', path: '#experience' },
  { name: 'Projects', path: '#projects' },
];

const DesktopNav = ({ active }) => {
  const [hovered, setHovered] = useState(null);
  // The pill follows the hovered link, falling back to the section in view
  const highlighted = hovered ?? active;

  return (
    <nav
      aria-label="Primary"
      onMouseLeave={() => setHovered(null)}
      className="hidden md:flex isolate items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1"
    >
      {navLinks.map((link) => {
        const id = link.path.slice(1);
        const isActive = active === id;

        return (
          <a
            key={link.name}
            href={link.path}
            onMouseEnter={() => setHovered(id)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              isActive || hovered === id ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {highlighted === id && (
              <motion.span
                layoutId="nav-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-background shadow-sm ring-1 ring-border/60"
              />
            )}
            {link.name}
          </a>
        );
      })}
    </nav>
  );
};

export { navLinks };
export default DesktopNav;

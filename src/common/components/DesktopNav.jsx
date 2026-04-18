import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Search } from 'lucide-react';

const navLinks = [
  { name: 'About', path: '#about' },
  { name: 'Experience', path: '#experience' },
  { name: 'Projects', path: '#projects' },
];

const DesktopNav = () => {
  return (
    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
      <div className="flex items-center gap-6 lg:gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.path}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            {link.name}
            <span className="absolute -bottom-[22px] left-0 w-full h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <div className="h-4 w-px bg-border/60" />
        
        <ThemeToggle />

        <a
          href="#contact"
          className="flex items-center justify-center rounded-md h-9 px-4 bg-brand hover:bg-blue-600 transition-all text-white text-xs font-mono font-bold tracking-tight shadow-sm active:scale-95"
        >
          GET_IN_TOUCH
        </a>
      </div>
    </nav>
  );
};

export { navLinks };
export default DesktopNav;

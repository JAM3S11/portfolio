import React from 'react';
import ThemeToggle from './ThemeToggle';

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
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-[#1392ec] transition-colors"
          >
            {link.name}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <ThemeToggle />

        <a
          href="#contact"
          className="flex items-center justify-center rounded-lg h-9 px-4 bg-[#1392ec] hover:bg-blue-600 transition-colors text-white text-sm font-bold tracking-wide shadow-sm hover:shadow-md active:scale-95"
        >
          Get in Touch
        </a>
      </div>
    </nav>
  );
};

export { navLinks };
export default DesktopNav;

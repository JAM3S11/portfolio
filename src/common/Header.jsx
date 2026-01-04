import React, { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X, Sun, Moon } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Logic to toggle 'dark' class on the HTML element
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const navLinks = [
    { name: 'Home', path: "#home"},
    { name: 'About', path: '#about' },
    { name: 'Experience', path: '#experience' },
    { name: 'Projects', path: '#projects' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a0f16] text-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-mono font-bold text-white">{">_"}</span>
          </div>
          <span className="text-xl font-bold tracking-tight">JDG</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.path} 
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              {link.name}
            </a>
          ))}
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="ml-4 p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link 
            to="/contact" 
            className="ml-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition-all hover:bg-blue-700 active:scale-95"
          >
            Get in Touch
          </Link>
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center gap-4 md:hidden">
          <button onClick={toggleDarkMode} className="p-2 text-gray-400">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Side Content (Mobile Drawer) */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-72 transform bg-[#0d141f] p-8 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } border-l border-gray-800 shadow-2xl`}
      >
        <div className="flex justify-end mb-10">
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={28} />
            </button>
        </div>
        
        <nav className="flex flex-col gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.path} 
              onClick={() => setIsOpen(false)}
              className="text-xl font-medium text-gray-300 transition-colors hover:text-blue-500"
            >
              {link.name}
            </a>
          ))}
          
          <div className="pt-4 border-t border-gray-800">
            <Link 
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center rounded-lg bg-blue-600 py-4 font-bold text-white hover:bg-blue-700"
            >
              Get in Touch
            </Link>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
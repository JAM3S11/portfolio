import React from 'react';
import { Download, Code2, Briefcase, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="bg-white dark:bg-[#19183B] flex flex-col items-center justify-center px-6 py-20 text-center transition-colors duration-300">
      
      {/* Availability Badge */}
      <div className="mb-8 flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 transition-all hover:bg-blue-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
          Available for work
        </span>
      </div>

      {/* Hero Text */}
      <h1 className="max-w-4xl text-5xl md:text-8xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
        Hello I Am <br />
        <span className="text-blue-500">James Daniel</span>
      </h1>

      <p className="max-w-2xl text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-10">
        Full-Stack Developer specializing in <span className="text-slate-700 dark:text-white font-bold">high-performance web applications</span>. 
        I bridge the gap between complex backend logic and intuitive user experiences.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95">
          <Download size={20} />
          Download Resume
        </button>
        
        {/* Native Smooth Scroll Link */}
        <a 
          href='#projects'
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-[#192233] border border-gray-200 dark:border-none font-bold hover:bg-gray-100 dark:hover:bg-[#232f48] text-gray-700 dark:text-white transition-all active:scale-95 hover:translate-x-1 hover:shadow-lg"
        >
          View Projects
        </a>
      </div>

      {/* Decorative Divider */}
      <div className="w-full max-w-md h-px bg-linear-to-r from-transparent via-gray-300 dark:via-gray-800 to-transparent mb-12"></div>

      {/* Quick Links / Social Icons */}
      <div className="flex items-center gap-8 text-gray-500">
        <a href="#projects" className="transition-colors hover:text-blue-500" title="Projects">
          <Code2 size={24} />
        </a>
        <a href="#experience" className="transition-colors hover:text-blue-500" title="Experience">
          <Briefcase size={24} />
        </a>
        <a href="#contact" className="transition-colors hover:text-blue-500" title="Contact">
          <Mail size={24} />
        </a>
      </div>

    </div>
  );
};

export default HomePage;
import React from 'react';
import { Download, Code2, Briefcase, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { TypingAnimation } from '@/common/typing-animation';
// import { Particles } from '@/components/ui/particles';
import { useTheme } from '@/content/ThemeProvider';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
import { cn } from '@/lib/utils';

const HomePage = () => {
  const { isDarkMode } = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, 
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative bg-white dark:bg-[oklch(0.13_0.028_261.692)] flex flex-col items-center justify-center px-6 py-20 text-center transition-colors duration-300 overflow-hidden"
    >
      
      {/* <Particles 
        variant='snow'
        className="absolute inset-0 z-0"
        customOptions={{
          particles: {
            color: {
              value: isDarkMode ? "#ffffff" : "#000000"
            },
            number: {
              value: 500
            },
            move: {
              speed: {
                min: 2,
                max: 4
              },
              // direction: "bottom",
              // straight: "true",
              // random: false
            }
          }
        }} /> */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <InteractiveGridPattern 
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%]"
          )} />
      </div>
      
      <div className='relative z-10 flex flex-col items-center'>
        {/* Availability Badge */}
        <motion.div variants={itemVariants} className="mb-8 flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 transition-all hover:bg-blue-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
            Available for work
          </span>
        </motion.div>

        {/* Hero Text */}
        <motion.h1 variants={itemVariants} className="max-w-4xl text-5xl md:text-8xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
          Hello I Am <br />
          <span className="text-blue-500">
            <TypingAnimation>James Daniel</TypingAnimation>
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="max-w-2xl text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-10">
          Full-Stack Developer specializing in <span className="text-slate-700 dark:text-white font-bold">high-performance web applications</span>. 
          I bridge the gap between complex backend logic and intuitive user experiences.
        </motion.p>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <motion.a 
            href="/JAMES_DANIEL_CV.pdf"
            download="James_Daniel_Resume.pdf"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            <Download size={20} />
            Download Resume
          </motion.a>

          <motion.a 
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            href='#projects'
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white dark:bg-[#192233] border border-gray-200 dark:border-none font-bold hover:bg-gray-100 dark:hover:bg-[#232f48] text-gray-700 dark:text-white transition-all hover:shadow-lg"
          >
            View Projects
          </motion.a>
        </motion.div>

        {/* Divider */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="w-full max-w-md h-px bg-linear-to-r from-transparent via-gray-300 dark:via-gray-800 to-transparent mb-12"
        ></motion.div>

        {/* Social Links */}
        <motion.div variants={itemVariants} className="flex items-center gap-8 text-gray-500">
          <motion.a whileHover={{ y: -5, color: '#3b82f6' }} href="#projects" className="transition-colors" title="Projects">
            <Code2 size={24} />
          </motion.a>
          <motion.a whileHover={{ y: -5, color: '#3b82f6' }} href="#experience" className="transition-colors" title="Experience">
            <Briefcase size={24} />
          </motion.a>
          <motion.a whileHover={{ y: -5, color: '#3b82f6' }} href="#contact" className="transition-colors" title="Contact">
            <Mail size={24} />
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
import React from 'react';
import { motion } from 'framer-motion';
import { 
  SiReact, SiJavascript, SiTypescript, SiTailwindcss, 
  SiNodedotjs, SiPython, SiPostgresql,
  SiGithub, SiFigma, SiVite, SiExpress, SiNextdotjs,
  SiMongodb, SiMysql, SiCanva,
  SiSupabase, SiDocker, SiPostman
} from 'react-icons/si';

const techMarqueeItems = [
  { name: 'React.js', icon: SiReact, color: '#61DAFB' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#000000' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
  { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
  { name: 'Express.js', icon: SiExpress, color: '#000000' },
  { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
  { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
  { name: 'Supabase', icon: SiSupabase, color: '#3ECF8E' },
  { name: 'MySQL', icon: SiMysql, color: '#4479A1' },
  { name: 'Python', icon: SiPython, color: '#3776AB' },
  { name: 'GitHub', icon: SiGithub, color: '#181717' },
  { name: 'Postman', icon: SiPostman, color: '#FF6C35' },
  { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
  { name: 'Canva', icon: SiCanva, color: '#00C4CC' },
  { name: 'Cursor AI', icon: SiVite, color: '#000000' },
  { name: 'Vite', icon: SiVite, color: '#646CFF' },
  { name: 'Docker', icon: SiDocker, color: '#2496ED' },
];

const MarqueeItem = ({ item }) => {
  const Icon = item.icon;
  return (
    <div className="relative group flex flex-col items-center justify-center mx-1 sm:mx-2 md:mx-3">
      <span className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-bold text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white dark:bg-[#1a1a2e] px-2 py-0.5 rounded-md shadow-md border border-gray-200 dark:border-gray-700 z-10">
        {item.name}
      </span>
      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all p-1.5 sm:p-2">
        <Icon size={24} sm:size={26} md:size={30} style={{ color: item.color, fill: item.color }} />
      </div>
    </div>
  );
};

const AboutPage = () => {
  const fadeInVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <section id="about" className="bg-background text-foreground px-6 pt-20 md:pt-32 pb-0 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Heading */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariant}
          className="mb-16"
        >
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 uppercase">About Me</h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-brand mx-auto rounded-full"
          ></motion.div>
        </motion.div>

        {/* Biography Content */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-6 text-lg leading-relaxed mb-20"
        >
          <motion.p variants={fadeInVariant} className='text-muted-foreground'>
            I am a self-motivated <span className="text-foreground font-semibold underline underline-offset-4 decoration-brand/30">Full-Stack Developer</span> dedicated 
            to the craft of building seamless, high-performance web applications. My approach to engineering 
            is driven by a core principle: I focus on writing clean, maintainable and readable code that makes 
            building and improving products feel smooth and enjoyable.
          </motion.p>

          <motion.p variants={fadeInVariant} className='text-muted-foreground'>
            I believe that great software is defined by the balance between a polished user experience and a 
            robust, scalable architecture. My technical journey is centered on mastering the modern web 
            stack, leveraging tools like <span className="text-foreground font-semibold">React.js, Tailwind CSS, Node.js, and Python</span> to 
            transform complex requirements into intuitive digital solutions.
          </motion.p>
        </motion.div>

        {/* Core Technologies Marquee */}
        <div className="mb-12 sm:mb-16 md:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
          >
            <h3 className="text-[10px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground uppercase">
              Core Technologies
            </h3>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              className="h-px grow bg-linear-to-r from-border to-transparent origin-left"
            ></motion.div>
          </motion.div>

          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-background to-transparent"></div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 sm:w-16 md:w-20 bg-gradient-to-l from-background to-transparent"></div>

            <motion.div 
              className="flex py-2 sm:py-4"
              initial={{ x: 0 }}
              animate={{ x: "-33.33%" }}
              transition={{ 
                duration: 19 * 0.4, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              {[...techMarqueeItems, ...techMarqueeItems, ...techMarqueeItems].map((item, idx) => (
                <MarqueeItem key={`${item.name}-${idx}`} item={item} />
              ))}
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutPage;
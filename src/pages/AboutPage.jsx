import React from 'react';
import { motion } from 'framer-motion';
// import { OrbitingCircles } from '@/components/ui/orbiting-circles';

const AboutPage = () => {
  const techCategories = [
    {
      title: "Frontend",
      skills: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript (ES6+)"]
    },
    {
      title: "Backend & DB",
      skills: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Python"]
    },
    {
      title: "Cloud & Tools",
      skills: ["AWS", "Docker", "Git", "Vite", "REST APIs"]
    },
    {
      title: "AI & IDE",
      skills: ["Gemini CLI", "Opencode", "Cursor AI"]
    },
    {
      title: "Tools & Devops",
      skills: ["Git", "Bash", "Powershell"]
    }
  ];

  // Animation variants
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
    <div id="about" className="bg-white dark:bg-[#19183B] text-gray-300 px-6 py-20 md:py-32 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Heading */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariant}
          className="mb-12"
        >
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">About Me</h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "200px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-px bg-linear-to-r from-transparent via-blue-500 to-transparent mx-auto"
          ></motion.div>
        </motion.div>

        {/* Biography Content */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-6 text-lg leading-relaxed"
        >
          <motion.p variants={fadeInVariant} className='text-gray-700 dark:text-gray-300'>
            I am a self-motivated <span className="text-slate-800 dark:text-white font-medium underline underline-offset-4 decoration-blue-500/30">Full-Stack Developer</span> dedicated 
            to the craft of building seamless, high-performance web applications. My approach to engineering 
            is driven by a core principle: I focus on writing clean, maintainable and readable code that makes 
            building and improving products feel smooth and enjoyable.
          </motion.p>

          <motion.p variants={fadeInVariant} className='text-gray-700 dark:text-gray-300'>
            I believe that great software is defined by the balance between a polished user experience and a 
            robust, scalable architecture. My technical journey is centered on mastering the modern web 
            stack, leveraging tools like <span className="text-slate-800 dark:text-white font-medium">React.js, Tailwind CSS, Node.js, and Python</span> to 
            transform complex requirements into intuitive digital solutions.
          </motion.p>
        </motion.div>

        {/* Modern Tech Showcase Section */}
        <div className="mt-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-8"
          >
             <h3 className="text-base font-bold tracking-[0.2em] text-gray-700 dark:text-gray-300 uppercase">
               Core Technologies
            </h3>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              className="h-px grow bg-linear-to-r from-gray-800 dark:from-gray-400 to-transparent origin-left"
            ></motion.div>
          </motion.div>
          
          {/* <div>
            <OrbitingCircles></OrbitingCircles>
          </div> */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {techCategories.map((category) => (
              <motion.div 
                key={category.title}
                variants={fadeInVariant}
                whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.5)" }}
                className="group p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 backdrop-blur-sm transition-all duration-300"
              >
                <h4 className="text-blue-600 dark:text-blue-400 font-bold mb-4 text-sm tracking-wide">
                  {category.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="text-xs font-semibold py-1 px-2 rounded-md bg-white dark:bg-[#111827] text-slate-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 group-hover:border-blue-500/30 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
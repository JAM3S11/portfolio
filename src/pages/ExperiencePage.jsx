import React from 'react';
import { motion } from 'framer-motion';

const ExperiencePage = () => {
  const experiences = [
    {
      company: "Ministry Of Information, Communication and The Digital Economy (MOICDE)",
      role: "Attachment",
      duration: "April 2023 - August 2023",
      points: [
        {
          label: "End-to-End Development",
          desc: "Developed a web-based IT Support Ticketing System, creating a seamless integration between a responsive frontend and a secure database backend."
        },
        {
          label: "Server-Side Logic",
          desc: "Implemented Role-Based Access Control (RBAC) and secure authentication workflows, resulting in improved collaboration for interdepartmental support operations."
        },
        {
          label: "Problem Solving",
          desc: "Troubleshoot and resolve critical logic bottlenecks using browser debugging tools, ensuring 99.9% uptime for the service desk module."
        },
        {
          label: "Collaboration",
          desc: "Worked closely with stakeholders to translate complex requirements into a sophisticated, dark-mode-supported user interface."
        }
      ]
    }
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    <section id="experience" className="bg-white dark:bg-[oklch(0.13_0.028_261.692)] text-gray-300 px-6 py-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
            Experience
          </h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
            className="w-45 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent rounded-sm mx-auto"
          ></motion.div>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Animated Vertical Line */}
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute left-1 top-2 w-px bg-gray-200 dark:bg-[#232f48] origin-top"
          ></motion.div>

          <div className="space-y-16">
            {experiences.map((exp, index) => (
              <motion.div 
                key={index}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-10"
              >
                
                {/* Timeline Dot with Glow */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  className="absolute left-0 top-2 z-10 h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] border-2 border-white dark:border-[oklch(0.13_0.028_261.692)]"
                ></motion.div>

                {/* Experience Header */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {exp.role}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold italic text-lg">
                      {exp.company}
                    </p>
                  </div>
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="inline-block px-4 py-1 text-sm font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 w-fit"
                  >
                    {exp.duration}
                  </motion.span>
                </motion.div>

                {/* Responsibility Details */}
                <div className="space-y-6">
                  {exp.points.map((point, i) => (
                    <motion.div 
                      key={i} 
                      variants={itemVariants}
                      className="group"
                    >
                      <h4 className="text-slate-800 dark:text-gray-200 font-bold text-base md:text-lg mb-1 group-hover:text-blue-500 transition-colors">
                        {point.label}:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base max-w-3xl">
                        {point.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperiencePage;
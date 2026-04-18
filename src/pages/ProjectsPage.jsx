import React, { useState } from 'react';
import { Github, ExternalLink, Pin, SignalMedium, Code2, Server, Layers, FileCode, BookOpen } from 'lucide-react';
import { MdElectricBolt } from "react-icons/md";
import { motion } from 'framer-motion';

const ProjectsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'frontend', label: 'Frontend', icon: Code2 },
    { id: 'backend', label: 'Backend', icon: Server },
    { id: 'fullstack', label: 'Full-Stack', icon: Layers },
  ];

  const projects = [
    {
        title: "Franatech Website",
        description: "A professional corporate landing page designed for technical services, focusing on conversion-driven UI and seamless responsive performance.",
        tech: ["HTML", "CSS", "Javascript"],
        github: "https://github.com/JAM3S11/franatech-website-template.git",
        live: "https://franatech-website-template.vercel.app/",
        image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-04-18%20210031.png",
        imageText: "Franatech",
        imageSubtext: "Modern website illustration",
        accentColor: "text-emerald-400",
        status: "Completed",
        category: "frontend",
        hasTests: false,
        hasDocs: false
      },
{
        title: "Open Weather Demo",
        description: "A real-time weather tracking application utilizing RESTful APIs to deliver accurate meteorological data with a focus on clean data visualization.",
        tech: ["React", "Tailwind", "Headless UI", "Lucide React", "Axios"],
        github: "https://openweatherapidemo.vercel.app/",
        live: "https://openweatherapidemo.vercel.app/",
        image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-01-06%20154823.png",
        imageText: "Open Weather Demo",
        imageSubtext: "REST API Integration",
        accentColor: "text-emerald-400",
        status: "Completed",
        category: "frontend",
        hasTests: false,
        hasDocs: false
      },
{
        title: "Greatwall",
        description: "A sovereign energy protocol merging AI and Web3 to decentralize the power grid, enhancing transparency and efficiency in the Kenyan energy sector.",
        tech: ["React", "Tailwind", "Headless UI", "Lucide React", "Framer Motion", "Web3.js"],
        github: "https://github.com/JAM3S11/greatwall.git",
        live: "https://greatwallhub.vercel.app/",
        image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-04-18%20210209.png",
        imageText: "Greatwall",
        imageSubtext: "Next-generation energy protocol",
        accentColor: "text-emerald-400",
        status: "InProgress",
        category: "fullstack",
        hasTests: false,
        hasDocs: false
      },
{
        title: "SOLEASE",
        description: "A full-scale ITSM platform featuring role-based access control, automated ticketing workflows, and real-time data analytics for organizational support.",
        tech: [
          "React 19", "TailwindCSS", "DaisyUI", "Zustand", "React Router", "Framer Motion", "MUI X Charts", "Axios",
          "Node.js", "Express 5", "MongoDB", "Mongoose", "JWT", "Nodemailer", "bcrypt", "crypto"
        ],
        github: "https://github.com/JAM3S11/solease.git",
        live: "#",
        image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-04-18%20204046.png",
        imageText: "SOLEASE",
        imageSubtext: "Comprehensive IT service management platform",
        accentColor: "text-emerald-400",
        status: "InProgress",
        category: "fullstack",
        hasTests: true,
        hasDocs: true
      },
{
        title: "eticketing",
        description: "A server-side IT support management system built with PHP and MySQL, streamlining ticket lifecycle management and inter-departmental collaboration.",
        tech: ["PHP", "MySQL", "CSS", "Bootstrap", "AJAX"],
        github: "https://github.com/JAM3S11/eticketing.git",
        live: "#",
        image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-01-06%20160745.png",
        imageText: "ETICKETING",
        imageSubtext: "IT Service Platform",
        accentColor: "text-emerald-400",
        status: "Completed",
        category: "backend",
        hasTests: false,
        hasDocs: false
      },
{
       title: "HOSPITABILITY",
       description: "Hospitality Kenya is a premium provider of hospitality supplies, delivering excellence from industrial detergents to luxury amenities across Kenya.",
       tech: ["Typescript", "Tailwind CSS", "Lucide React", "React-Router"],
       github: "https://github.com/JAM3S11/hospitality.git",
       live: "https://sparklesltd.vercel.app",
       image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-04-18%20210325.png",
       imageText: "HOSPITALITY",
       imageSubtext: "Hospitality service provider",
       accentColor: "text-emerald-400",
       status: "Demo Illustration",
       category: "frontend",
       hasTests: false,
       hasDocs: false
     },
{
       title: "WANTACH WORKFLOW ILLUSTRATION",
       description: "An n8n-style automation workflow diagram built with Next.js 14, TypeScript, and Tailwind CSS. This project visualizes the end-to-end registration process for RegEase Kenya, including client intake, document validation, government portal integration and payment automation",
       tech: ["Typescript", "Tailwind CSS", "Lucide React", "React-Router"],
       github: "https://github.com/JAM3S11/regease-workflow.git",
       live: "https://wantach-workflow.vercel.app",
       image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-04-18%20212549.png",
       imageText: "WANTACH WORKFLOW ILLUSTRATION",
       imageSubtext: "An n8n-style automation workflow",
       accentColor: "text-emerald-400",
       status: "n8n Workflow Illustrator",
       category: "frontend",
       hasTests: false,
       hasDocs: false
     }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    <section id="projects" className='bg-background text-foreground px-6 py-20 transition-colors duration-300'>
      <div className='max-w-6xl mx-auto'>

        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='mb-8 sm:mb-12'
        >
          <h2 className='text-center text-2xl sm:text-3xl md:text-4xl font-bold text-foreground uppercase tracking-tight mb-4'>
            Projects
          </h2>
<motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "80px" }}
              transition={{ duration: 1, delay: 0.5 }}
              className='h-1 bg-brand mx-auto rounded-full w-16 sm:w-24 md:w-28'
          ></motion.div>
        </motion.div>

        {/* Category Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12'
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeFilter === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-gray-100 dark:bg-[#111827] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#1a2332] border border-gray-200 dark:border-gray-800'
                }`}
              >
                <Icon size={16} />
                {cat.label}
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {cat.id === 'all' ? projects.length : projects.filter(p => p.category === cat.id).length}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Projects Grid */}
        <motion.div 
          key={activeFilter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8'
        >
          {filteredProjects.map((project, index) => {
            const displayedTech = project.tech.slice(0, 5);
            const remainingCount = project.tech.length - 5;

            return (
              <motion.div 
                key={index} 
                variants={cardVariants}
                whileHover={{ y: -10 }}
                className='flex flex-col rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111827]/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300 group shadow-sm hover:shadow-2xl hover:shadow-blue-500/10'
              >
{/* Image preview */}
                  <div className={`relative h-40 sm:h-44 md:h-48 lg:h-52 overflow-hidden border-b border-gray-200 dark:border-gray-800 ${project.title === 'eticketing' ? 'bg-linear-to-br from-[oklch(0.13_0.028_261.692)] to-[#0d1117]' : 'bg-[#0d1117]'}`}>
                    {project.title !== 'eticketing' && (
                      <motion.img
                        src={project.image}
                        alt={project.title}
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}

                   {/* Hover Overlay */}
                   <div className='absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md'>
                     <h3 className={`text-3xl font-black mb-2 tracking-tighter translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ${project.accentColor}`}>
                       {project.imageText}
                     </h3>
                     <p className='text-[10px] text-gray-100 uppercase tracking-[0.2em] font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75'>
                       {project.imageSubtext}
                     </p>
                   </div>

                   {/* Status Badge */}
                   <div className={`absolute top-2 right-2 z-20 flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase rounded-full shadow-md tracking-wider origin-right transform transition-all duration-300 group-hover:scale-105 backdrop-blur-sm bg-white/10 border border-white/20 text-blue-700/80`}>
                     {project.status === 'Completed' ? <Pin size={14} /> 
                      : project.status === "Demo Illustration" 
                      ? <SignalMedium size={14} /> 
                      : <MdElectricBolt size={14} />}
                     {project.status}
                   </div>
                </div>

                {/* Project Content */}
                <div className='p-4 sm:p-5 md:p-6 flex flex-col grow'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors'>
                      {project.title}
                    </h3>
                    <div className='flex items-center gap-3'>
                      {/* Code Quality Indicators */}
                      {(project.hasTests || project.hasDocs) && (
                        <div className='flex gap-2 mr-2'>
                          {project.hasTests && (
                            <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400' title='Tests'>
                              <FileCode size={14} />
                              <span className='text-[10px] font-bold'>Tests</span>
                            </div>
                          )}
                          {project.hasDocs && (
                            <div className='flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400' title='API Docs'>
                              <BookOpen size={14} />
                              <span className='text-[10px] font-bold'>Docs</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className='flex gap-3 text-gray-500 dark:text-gray-400'>
                        <motion.a 
                          whileHover={{ scale: 1.2, color: '#3b82f6' }}
                          href={project.github} 
                          target="_blank" 
                          rel="noreferrer" 
                          className='transition-colors'
                        >
                          <Github size={20} />
                        </motion.a>
                        <motion.a 
                          whileHover={{ scale: 1.2, color: '#3b82f6' }}
                          href={project.live} 
                          target="_blank" 
                          rel="noreferrer" 
                          className='transition-colors'
                        >
                          <ExternalLink size={20} />
                        </motion.a>
                      </div>
                    </div>
                  </div>

                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed'>
                    {project.description}
                  </p>

                  <div className='mt-auto flex flex-wrap gap-2'>
                    {displayedTech.map((t, i) => (
                      <motion.span 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i }}
                        className='px-3 py-1 text-[11px] font-bold rounded-full border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 group-hover:border-emerald-500 transition-colors'
                      >
                        {t}
                      </motion.span>
                    ))}
                    {remainingCount > 0 && (
                      <span className='px-3 py-1 text-[11px] font-bold rounded-full border border-gray-500/30 text-gray-400 bg-gray-500/5'>
                        +{remainingCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsPage;
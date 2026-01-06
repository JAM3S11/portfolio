import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

const ProjectsPage = () => {
  const projects = [
    {
      title: "Franatech Website",
      description: "A professional corporate landing page designed for technical services, focusing on conversion-driven UI and seamless responsive performance.",
      tech: ["HTML", "CSS", "Javascript"],
      github: "https://github.com/JAM3S11/franatech-website-template.git",
      live: "https://franatech-website-template.vercel.app/",
      image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-01-06%20153752.png",
      imageText: "Franatech",
      imageSubtext: "Modern website illustration",
      accentColor: "text-emerald-400"
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
      accentColor: "text-emerald-400"
    },
    {
      title: "Greatwall",
      description: "A sovereign energy protocol merging AI and Web3 to decentralize the power grid, enhancing transparency and efficiency in the Kenyan energy sector.",
      tech: ["React", "Tailwind", "Headless UI", "Lucide React", "Framer Motion", "Web3.js"],
      github: "https://github.com/JAM3S11/greatwall.git",
      live: "https://greatwalllits.netlify.app/",
      image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-01-06%20160745.png",
      imageText: "Greatwall",
      imageSubtext: "Next-generation energy protocol",
      accentColor: "text-emerald-400"
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
      image: "https://ik.imagekit.io/jimdanliveurl/Screenshot%202025-12-29%20173633.png",
      imageText: "SOLEASE",
      imageSubtext: "Comprehensive IT service management platform",
      accentColor: "text-emerald-400"
    },
    {
      title: "eticketing",
      description: "A server-side IT support management system built with PHP and MySQL, streamlining ticket lifecycle management and inter-departmental collaboration.",
      tech: ["PHP", "MySQL", "CSS", "Bootstrap", "AJAX"],
      github: "https://github.com/JAM3S11/eticketing.git",
      live: "#",
      image: "#",
      imageText: "ETICKETING",
      imageSubtext: "IT Service Platform",
      accentColor: "text-emerald-400"
    }
  ];

  return (
    <div className='bg-white dark:bg-[#19183B] text-gray-300 px-6 py-20 transition-colors duration-300'>
      <div className='max-w-4xl mx-auto'>

        {/* Section Heading */}
        <div className='mb-16'>
          <h2 className='text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2'>
            Projects
          </h2>
          <div className='w-40 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent mx-auto mb-12'></div>
        </div>

        {/* Projects Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {projects.map((project, index) => {
            const displayedTech = project.tech.slice(0, 5);
            const remainingCount = project.tech.length - 5;

            return (
              <div 
                key={index} 
                className='flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111827]/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300 group'
              >
                {/* Image preview */}
                <div className='relative h-52 bg-[#0d1117] overflow-hidden border-b border-gray-200 dark:border-gray-800'>
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm'>
                    <h3 className={`text-3xl font-black mb-2 tracking-tighter translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ${project.accentColor}`}>
                      {project.imageText}
                    </h3>
                    <p className='text-[10px] text-gray-200 uppercase tracking-[0.2em] font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75'>
                      {project.imageSubtext}
                    </p>
                  </div>
                </div>

                {/* Project Content */}
                <div className='p-6 flex flex-col grow'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-xl font-bold text-slate-900 dark:text-white'>
                      {project.title}
                    </h3>
                    <div className='flex gap-4 text-gray-500 dark:text-gray-400'>
                      <a href={project.github} target="_blank" rel="noreferrer" className='hover:text-blue-500 transition-colors'>
                        <Github size={20} />
                      </a>
                      <a href={project.live} target="_blank" rel="noreferrer" className='hover:text-blue-500 transition-colors'>
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>

                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3'>
                    {project.description}
                  </p>

                  <div className='mt-auto flex flex-wrap gap-2'>
                    {displayedTech.map((t, i) => (
                      <span 
                        key={i} 
                        className='px-3 py-1 text-[11px] font-bold rounded-full border border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                      >
                        {t}
                      </span>
                    ))}
                    {remainingCount > 0 && (
                      <span className='px-3 py-1 text-[11px] font-bold rounded-full border border-gray-500/30 text-gray-400 bg-gray-500/5'>
                        +{remainingCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
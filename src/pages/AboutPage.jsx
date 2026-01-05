import React from 'react';

const AboutPage = () => {
  const techStack = [
    "JavaScript (ES6+)", "React.js", "Next.js", "Node.js", 
    "TypeScript", "Tailwind CSS", "PostgreSQL", "AWS"
  ];

  return (
    <div className="bg-white dark:bg-[#19183B] text-gray-300 px-6 py-20 md:py-32">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Heading */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">About Me</h2>
          <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
        </div>

        {/* Biography Content */}
        <div className="space-y-6 text-lg leading-relaxed">
          <p className='text-gray-700 dark:text-gray-300'>
            I am a self-motivated <span className="text-slate-800 dark:text-white font-medium">Full-Stack Developer</span> dedicated 
            to the craft of building seamless, high-performance web applications. My approach to engineering 
            is driven by a core principle: I focus on writing clean, maintainable and readable code that makes 
            building and improving products feel smooth and enjoyable.
          </p>

          <p>
            I believe that great software is defined by the balance between a polished user experience and a 
            robust, scalable architecture. My technical journey is centered on mastering the modern web 
            stack—leveraging tools like <span className="text-white">React.js, Tailwind CSS, and Node.js</span>—to 
            transform complex requirements into intuitive digital solutions. I am particularly interested in how 
            emerging technologies can be used to modernize traditional systems.
          </p>

          <p>
            Beyond writing code, I am a lifelong learner committed to staying at the forefront of industry standards. 
            Whether I am architecting a new interface or refining a backend workflow, my goal is to deliver software 
            that is as <span className="italic text-blue-400">elegant and efficient</span> under the hood as it is on the surface.
          </p>
        </div>

        {/* Core Technologies Section */}
        <div className="mt-16">
          <h3 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-6">
            Core Technologies
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {techStack.map((tech) => (
              <span 
                key={tech}
                className="px-4 py-2 rounded-lg bg-[#111827] border border-gray-800 text-sm font-medium text-gray-400 hover:border-blue-500/50 hover:text-white transition-all cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
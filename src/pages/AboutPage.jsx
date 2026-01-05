import React from 'react';

const AboutPage = () => {
  // Categorized tech stack for a more professional "showcase" feel
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
      title: "AI",
      skills: ["Gemini CLI", "Opencode"]
    },
    {
      title: "Tools & Devops",
      skills: ["Git", "Bash", "Powershell"]
    }
  ];

  return (
    <div className="bg-white dark:bg-[#19183B] text-gray-300 px-6 py-20 md:py-32 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Heading */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">About Me</h2>
          <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
        </div>

        {/* Biography Content */}
        <div className="space-y-6 text-lg leading-relaxed">
          <p className='text-gray-700 dark:text-gray-300'>
            I am a self-motivated <span className="text-slate-800 dark:text-white font-medium underline underline-offset-4 decoration-blue-500/30">Full-Stack Developer</span> dedicated 
            to the craft of building seamless, high-performance web applications. My approach to engineering 
            is driven by a core principle: I focus on writing clean, maintainable and readable code that makes 
            building and improving products feel smooth and enjoyable.
          </p>

          <p className='text-gray-700 dark:text-gray-300'>
            I believe that great software is defined by the balance between a polished user experience and a 
            robust, scalable architecture. My technical journey is centered on mastering the modern web 
            stack, leveraging tools like <span className="text-slate-800 dark:text-white font-medium">React.js, Tailwind CSS, Node.js, and Python</span> to 
            transform complex requirements into intuitive digital solutions.
          </p>
        </div>

        {/* Modern Tech Showcase Section */}
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
             <h3 className="text-base font-bold tracking-[0.2em] text-gray-700 dark:text-gray-300 uppercase">
              Core Technologies
            </h3>
            <div className="h-px grow bg-linear-to-r from-gray-800 dark:from-gray-400 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techCategories.map((category) => (
              <div 
                key={category.title}
                className="group p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300"
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
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
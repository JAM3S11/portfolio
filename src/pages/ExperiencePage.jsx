import React from 'react';

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

  return (
    <section id="experience" className="bg-white dark:bg-[#19183B] text-gray-300 px-6 py-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Heading with Blue Bar */}
        <div className="mb-16">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
            Experience
          </h2>
          <div className="w-45 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent rounded-sm mx-auto"></div>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Continuous Vertical Line */}
          <div className="absolute left-1 top-2 bottom-0 w-px bg-gray-200 dark:bg-[#232f48]"></div>

          <div className="space-y-16">
            {experiences.map((exp, index) => (
              <div key={index} className="relative pl-10">
                
                {/* Timeline Dot with Glow */}
                <div className="absolute left-0 top-2 z-10 h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] border-2 border-white dark:border-[#19183B]"></div>

                {/* Experience Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {exp.role}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold italic text-lg">
                      {exp.company}
                    </p>
                  </div>
                  <span className="inline-block px-4 py-1 text-sm font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {exp.duration}
                  </span>
                </div>

                {/* Responsibility Details */}
                <div className="space-y-6">
                  {exp.points.map((point, i) => (
                    <div key={i} className="group">
                      <h4 className="text-slate-800 dark:text-gray-200 font-bold text-base md:text-lg mb-1">
                        {point.label}:
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base max-w-3xl">
                        {point.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperiencePage;
import React from 'react'

const ProjectsPage = () => {
  const projects = [
    {
      title: "Franatech Website",
      description: "A sample project majorly concentrating on the frontend part",
      tech: ["HTML", "CSS", "Jacascript"],
      github: "https://github.com/JAM3S11/franatech-website-template.git",
      live: "https://franatech-website-template.vercel.app/",
      imageText: "Franatech",
      imageSubtext: "Discover, Fix, and Contribute to Open Source with Ease"
    }
  ]
  return (
    <div className='bg-white dark:bg-[#19183B] text-gray-300 px-6 py-20 transition-colors duration-300'>
        <div className='max-w-4xl mx-auto'>

            <div className='mb-16'>
                <h2 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2'>
                    Projects
                </h2>
                <div className='w-16 h-1 bg-blue-500 rounded-full'>
                  {/* Projects display is done here */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {projects.map((project, index) => (
                      <div
                        key={index}
                        className='flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111827]/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300 group'
                      >
                        {/* Image preview */}
                        <div
                          className='relative h-56 bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden border-b border-gray-200 dark:border-gray-800'
                        >
                          <div className='absolute inset-0 bg-linear-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity' />
                          <h3 className={`text-4xl font-black mb-2 ${project.accent || 'text-slate-900'}`}>
                            {project.imageText}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ProjectsPage
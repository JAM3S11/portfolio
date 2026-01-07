import { Github, Mail, Phone } from 'lucide-react'
import React from 'react'

const ContactPage = () => {
    const DocumentationURL = import.meta.env.VITE_GITHUB_URL;

    const handleDocsLink = (e) => {
      e.preventDefault();
      if(DocumentationURL){
        window.open(DocumentationURL, '_blank', 'noopener,noreferrer');
      } else {
        console.warn('Documentation URL not found in the .env file');
      }
    }
  return (
    <div id='contact' className='bg-white dark:bg-[#19183B] text-gray-300 px-6 py-20 transition-colors duration-300'>
        <div className='max-w-4xl mx-auto'>

            {/* Header section */}
            <div className='mb-16'>
                <h3 className='text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2'>
                    Get in touch
                </h3>
                <div className='w-60 h-px mb-12 mx-auto bg-linear-to-r from-transparent via-blue-500 to-transparent'></div>
            </div>

            {/* Contents */}
            <div className='grid md:grid-cols-2 gap-16 items-start'>

                {/* Left column */}
                <div className='space-y-3'>
                    <p className='text-2xl md:text-3xl text-gray-800 dark:text-gray-200 mb-2'>
                        Let's Connect
                    </p>
                    <p className='text-gray-700 dark:text-gray-400 text-lg leading-relaxed mb-8 max-w-md'>
                    I would love to hear from you and how I could help. Please fill in the form and I'll get back to you as soon as possible. As well as feel free to reach.
                    </p>

                    <div className='space-y-4'>
                        <div className='flex items-center gap-4 bg-slate-300 dark:bg-[#111827]/50 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl hover:border-blue-500/50 transition-all duration-300 group'>
                            <div className='w-10 h-10 rounded-lg text-gray-700 dark:text-gray-400 bg-[#c0bed8] dark:bg-[#19183B]/80 flex items-center justify-center'>
                                <Mail size={25} />
                            </div>
                            <div>
                                <p className='text-[15px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-300'>
                                    Mail
                                </p>
                                <p className='font-semibold text-gray-600 dark:text-gray-400'>
                                    jdndirangu2020@gmail.com
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-4 bg-slate-300 dark:bg-[#111827]/50 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl hover:border-blue-500/50 transition-all duration-300 group'>
                            <div className='w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-400 bg-[#c0bed8] dark:bg-[#19183B]/80 rounded-lg'>
                                <Phone size={25} />
                            </div>
                            <div>
                                <p className='text-[15px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-300'>
                                    Phone
                                </p>
                                <p className='font-semibold text-gray-600 dark:text-gray-400'>
                                    +254 716 041419
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <p className='font-bold text-base text-gray-700 dark:text-gray-400 mb-2'>
                            Connect on social
                        </p>
                        <div className='grid grid-cols-3 gap-1'>
                            <div className='w-10 h-10 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 flex items-center justify-center'>
                                <Github size={25} />
                            </div>
                            <div className='w-10 h-10 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 flex items-center justify-center'>
                                <Github size={25} />
                            </div>
                            <div className='w-10 h-10 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 flex items-center justify-center'>
                                <Github size={25} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ContactPage
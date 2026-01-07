import { Github, Linkedin, Mail, Phone, Send } from 'lucide-react';
import React from 'react';
import Whatsapp from '../assets/whatsapp.svg';

const ContactPage = () => {
    const socialLinks = [
        { name: "Github", icon: <Github size={25} />, url: import.meta.env.VITE_GITHUB_URL },
        { name: "LinkedIn", icon: <Linkedin size={25} />, url: import.meta.env.VITE_LINKEDIN_URL },
        { name: "WhatsApp", icon: <img src={Whatsapp} alt='WhatsApp'className="w-6 h-6 dark:invert" />, url: import.meta.env.VITE_WHATSAPP_URL }
    ]
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
                <div className='space-y-8'>
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
                        <div className='flex items-center gap-3'>
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    title={social.name}
                                    className='w-12 h-12 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 backdrop-blur-sm text-gray-700 dark:text-gray-400 hover:text-blue-500 hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center shadow-sm'
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right hand side form */}
                <form className='space-y-4 bg-slate-400 dark:bg-[#111827]/50 border border-gray-200 dark:border-gray-800 p-8 rounded-xl'>
                    <div className='grid grid-cols-1 gap-4'>
                        <div>
                            <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1'>
                                Full Name:
                            </label>
                            <input
                                type='text'
                                placeholder='John Doe'
                                className='w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#19183B] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-blue-500 text-gray-800 dark:text-white transition-all'
                             />
                        </div>
                        <div>
                            <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1'>
                                Email
                            </label>
                            <input
                                type='email'
                                placeholder='johndoe@gmail.com'
                                className='w-full py-4 px-5 rounded-2xl bg-white dark:bg-[#19183B] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-blue-500 text-gray-800 dark:text-white transition-all'
                             />
                        </div>
                        <div>
                            <label className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1'>Message</label>
                            <textarea 
                                rows="4" 
                                placeholder="How can I help you?" 
                                className='w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#19183B] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-blue-500 text-gray-800 dark:text-white transition-all resize-none'
                            ></textarea>
                        </div>
                    </div>
                    <button className='w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/50'>
                        <Send size={25} />{" "}Send Message
                    </button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default ContactPage
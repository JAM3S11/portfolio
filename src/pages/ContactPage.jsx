import React from 'react'

const ContactPage = () => {
  return (
    <div id='contact' className='bg-white dark:bg-[#19183B] text-gray-300 px-6 py-20 transition-colors duration-300'>
        <div className='max-w-4xl mx-auto'>

            {/* Header section */}
            <div className='mb-16'>
                <h3 className='text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2'>
                    Get in touch
                </h3>
                <div className='w-50 h-1 mb-12 mx-auto bg-linear-to-r from-transparent via-blue-500 to-transparent'></div>
            </div>

            {/* Contents */}
            <div className='grid md:grid-cols-2 gap-16 items-start'>

                {/* Left column */}
                <div className='space-y-3'>
                    <p className='text-2xl md:text-3xl text-gray-800 dark:text-gray-200'>
                        Let's Connect
                    </p>
                    <p className='text-gray-700 dark:text-gray-400 text-lg leading-relaxed mb-8 max-w-md'>
                    I would love to hear from you and how I could help. Please fill in the form and I'll get back to you as soon as possible.
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ContactPage
import React from 'react';

const Footer = () => {
  return (
    <div className='w-full bg-white dark:bg-[oklch(0.13_0.028_261.692)] transition-all'>
        <div className='max-w-4xl mx-auto border-t border-gray-100 dark:border-[#232f48] py-8'>

            <div className='flex items-center flex-col gap-2'>
                <p className='text-gray-500 dark:text-gray-400 text-base font-medium'>&copy; {new Date().getFullYear()} All rights reserved</p>
                <a 
                    href='https://github.com/JAM3S11'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-400 dark:text-gray-500 text-xs'
                >
                    Built by James Daniel
                </a>
            </div>
        </div>
    </div>
  )
}

export default Footer
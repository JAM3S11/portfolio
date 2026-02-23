import React from 'react';
import { motion } from 'framer-motion';
import { IconCloud } from '@/components/ui/icon-cloud';
import { AnimatedList } from '@/components/ui/animated-list';

const getTechCategory = (slug) => {
  const categoryMap = {
    react: "Frontend", nextdotjs: "Frontend", typescript: "Frontend", javascript: "Frontend",
    html5: "Frontend", css3: "Frontend", tailwindcss: "Frontend",
    express: "Backend", postgresql: "Database", mongodb: "Database", python: "Backend", nodejs: "Backend",
    amazonaws: "Cloud", docker: "DevOps", git: "DevOps", github: "DevOps", gitlab: "DevOps",
    vercel: "Cloud", firebase: "Cloud", nginx: "Cloud",
    visualstudiocode: "IDE", androidstudio: "IDE", cursorai: "AI", figma: "Design", canva: "Design",
    postman: "Tools", jest: "Testing", android: "Mobile"
  };
  return categoryMap[slug] || "Tools";
};

const TechNotification = ({ tech }) => {
  const category = getTechCategory(tech.slug);
  const displayName = tech.slug === "nextdotjs" ? "Next.js" 
    : tech.slug === "amazonaws" ? "AWS"
    : tech.slug === "html5" ? "HTML5"
    : tech.slug === "css3" ? "CSS3"
    : tech.slug === "cursorai" ? "Cursor AI"
    : tech.slug.replace(/([A-Z])/g, ' $1').trim();

  return (
    <a
      href={tech.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${displayName} documentation in a new tab`}
      className="group flex w-full max-w-[330px] items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white/80 px-4 py-3 shadow-sm shadow-neutral-200/60 backdrop-blur-sm transition-all hover:border-blue-500/60 hover:shadow-[0_14px_40px_rgba(37,99,235,0.18)] hover:-translate-y-1 active:translate-y-0 dark:border-neutral-700/70 dark:bg-neutral-900/80 dark:shadow-neutral-900/60"
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 ring-2 ring-blue-500/0 group-hover:ring-blue-500/30 transition-colors">
        <img 
          src={tech.logo} 
          alt={displayName}
          className="h-8 w-8 object-contain"
        />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
          {displayName}
        </span>
        <span className="text-[11px] font-medium tracking-wide text-blue-600 dark:text-blue-400">
          {category}
        </span>
      </div>
    </a>
  );
};

const AboutPage = () => {
  const techStack = [
    { slug: "typescript", url: "https://www.typescriptlang.org/" },
    { slug: "javascript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { slug: "nextdotjs", url: "https://nextjs.org/" },
    { slug: "postman", url: "https://www.postman.com/" },
    { slug: "cursorai", url: "https://cursor.com/" },
    { slug: "java", url: "https://www.java.com/" },
    { slug: "react", url: "https://react.dev/" },
    { slug: "android", url: "https://developer.android.com/" },
    { slug: "html5", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
    { slug: "css3", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    { slug: "express", url: "https://expressjs.com/" },
    { slug: "amazonaws", url: "https://aws.amazon.com/" },
    { slug: "postgresql", url: "https://www.postgresql.org/" },
    { slug: "firebase", url: "https://firebase.google.com/" },
    { slug: "nginx", url: "https://www.nginx.com/" },
    { slug: "vercel", url: "https://vercel.com/" },
    { slug: "jest", url: "https://jestjs.io/" },
    { slug: "docker", url: "https://www.docker.com/" },
    { slug: "git", url: "https://git-scm.com/" },
    { slug: "github", url: "https://github.com/" },
    { slug: "gitlab", url: "https://about.gitlab.com/" },
    { slug: "visualstudiocode", url: "https://code.visualstudio.com/" },
    { slug: "androidstudio", url: "https://developer.android.com/studio" },
    { slug: "canva", url: "https://www.canva.com/" },
    { slug: "figma", url: "https://www.figma.com/" },
  ];
  
  const images = techStack.map(item => 
    item.slug === "cursorai" 
      ? "https://mintlify.s3-us-west-1.amazonaws.com/cursor/logo/light.png"
      : `https://cdn.simpleicons.org/${item.slug}`
  );

  const techLogos = techStack.map((tech, i) => ({
    ...tech,
    logo: images[i]
  }));

  const fadeInVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div id="about" className="bg-white dark:bg-[oklch(0.13_0.028_261.692)] text-gray-300 px-6 pt-20 md:pt-32 pb-0 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Heading */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariant}
          className="mb-12"
        >
          <h2 className="text-center text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">About Me</h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "200px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-px bg-linear-to-r from-transparent via-blue-500 to-transparent mx-auto"
          ></motion.div>
        </motion.div>

        {/* Biography Content */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-6 text-lg leading-relaxed"
        >
          <motion.p variants={fadeInVariant} className='text-gray-700 dark:text-gray-300'>
            I am a self-motivated <span className="text-slate-800 dark:text-white font-medium underline underline-offset-4 decoration-blue-500/30">Full-Stack Developer</span> dedicated 
            to the craft of building seamless, high-performance web applications. My approach to engineering 
            is driven by a core principle: I focus on writing clean, maintainable and readable code that makes 
            building and improving products feel smooth and enjoyable.
          </motion.p>

          <motion.p variants={fadeInVariant} className='text-gray-700 dark:text-gray-300'>
            I believe that great software is defined by the balance between a polished user experience and a 
            robust, scalable architecture. My technical journey is centered on mastering the modern web 
            stack, leveraging tools like <span className="text-slate-800 dark:text-white font-medium">React.js, Tailwind CSS, Node.js, and Python</span> to 
            transform complex requirements into intuitive digital solutions.
          </motion.p>
        </motion.div>

        {/* Modern Tech Showcase Section */}
        <div className="mt-12 space-y-1 flex flex-col">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-2"
          >
             <h3 className="text-base font-bold tracking-[0.2em] text-gray-700 dark:text-gray-300 uppercase">
               Core Technologies
            </h3>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              className="h-px grow bg-linear-to-r from-gray-800 dark:from-gray-400 to-transparent origin-left"
            ></motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20}}
            whileInView={{ opacity: 1, x: 0}}
            viewport={{ once: true}}
            className='relative isolate flex items-center justify-center w-full h-[65vh] min-h-[350px] md:h-[75vh] lg:h-[80vh] xl:h-[85vh] -mt-10 mb-0'
          >
            {/* Mobile: AnimatedList */}
            <div className="md:hidden w-full overflow-hidden rounded-2xl border border-neutral-200/70 bg-linear-to-b from-slate-50 via-white to-slate-50/70 px-3 py-6 shadow-sm dark:border-white/5 dark:bg-linear-to-b dark:from-[oklch(0.18_0.028_261.692)] dark:via-[oklch(0.18_0.028_261.692)] dark:to-[oklch(0.18_0.028_261.692)]/80">
              <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                Tools I use day to day
              </p>
              <div className="h-[340px]">
                <AnimatedList
                  stackGap={8}
                  columnGap={80}
                  scaleFactor={0}
                  scrollDownDuration={12}
                  formationDuration={1.1}
                >
                  {techLogos.map((tech, index) => (
                    <TechNotification key={index} tech={tech} />
                  ))}
                </AnimatedList>
              </div>
            </div>
            {/* Desktop: IconCloud */}
            <div className="hidden md:block w-full h-full">
              <IconCloud images={images} techData={techStack} />
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;

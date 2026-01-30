import React from 'react';
import { motion } from 'framer-motion';
// import { CloudOrbit, OrbitingImage } from '@/components/ui/cloud-orbit';
import { IconCloud } from '@/components/ui/icon-cloud';

const AboutPage = () => {
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
      title: "AI & IDE",
      skills: ["Gemini CLI", "Opencode", "Cursor AI"]
    },
    {
      title: "Tools & Devops",
      skills: ["Git", "Bash", "Powershell"]
    }
  ];
  // const orbitingFrameworksData = [
  //   {
  //     speed: 20,
  //     radius: 119,
  //     size: 53,
  //     startAt: 0.15625,
  //     images: [
  //       {
  //         name: "React",
  //         url: "https://cdn.badtz-ui.com/images/components/cloud-orbit/react-logo.webp"
  //       },
  //       {
  //         name: "Tailwind CSS",
  //         url: "https://cdn.badtz-ui.com/images/components/cloud-orbit/tailwindcss-logo.webp"
  //       }
  //     ]
  //   }
  // ];

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

  // Animation variants
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
    <div id="about" className="bg-white dark:bg-[#19183B] text-gray-300 px-6 pt-20 md:pt-32 pb-0 transition-colors duration-300">
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
          
          {/* <motion.div
            initial={{ opacity: 0, x: -20}}
            whileInView={{ opacity: 1, x: 0}}
            viewport={{ once: true}}
            className='relative isolate flex items-center justify-center w-full h-64 mb-12 overflow-hidden'>
            <CloudOrbit
              duration={3}
              size={110}
              images={[
                {
                  name: "James Daniel",
                  url: "https://cdn.badtz-ui.com/images/components/cloud-orbit/avatar-1.webp",
                },
                {
                  name: "JDG",
                  url: "https://cdn.badtz-ui.com/images/components/cloud-orbit/avatar-2.webp"
                }
              ]}>
              {orbitingFrameworksData.map((orbit, index) => (
                <OrbitingImage 
                  key={index}
                  speed={orbit.speed}
                  radius={orbit.radius}
                  size={orbit.size}
                  startAt={orbit.startAt}
                  images={orbit.images}
                  duration={3}
                />
              ))}
            </CloudOrbit>
          </motion.div> */}
          <motion.div
            initial={{ opacity: 0, x: -20}}
            whileInView={{ opacity: 1, x: 0}}
            viewport={{ once: true}}
            className='relative isolate flex items-center justify-center w-full h-[500px] -mt-10 mb-0'>
            <IconCloud images={images} techData={techStack} />
          </motion.div>
          {/* <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {techCategories.map((category) => (
              <motion.div 
                key={category.title}
                variants={fadeInVariant}
                whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.5)" }}
                className="group p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 backdrop-blur-sm transition-all duration-300"
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
              </motion.div>
            ))}
          </motion.div> */}
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
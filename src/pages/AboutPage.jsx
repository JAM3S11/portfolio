import React from 'react';
import { motion } from 'framer-motion';
import { 
  SiReact, SiJavascript, SiTypescript, SiTailwindcss, 
  SiNodedotjs, SiPython, SiPostgresql, SiGit, 
  SiGithub, SiFigma, SiVite, SiExpress, SiNextdotjs,
  SiMongodb, SiMysql, SiCanva,
  SiSupabase
} from 'react-icons/si';
import { Globe, Smartphone, Rocket } from 'lucide-react';
import { IconCloud } from '@/components/ui/icon-cloud';

const CursorIcon = ({ size }) => (
  <img 
    src="https://ik.imagekit.io/jimdanliveurl/cursorImg.jpg" 
    alt="Cursor AI" 
    style={{ width: size, height: size }}
    className="object-contain"
  />
);

const coreTechnologyGroups = [
  {
    title: 'Frontend Development',
    accent: 'from-blue-500 to-cyan-400',
    skills: [
      { name: 'React.js', experience: '3+ years', level: 'Expert', progress: 96, icon: SiReact, color: 'text-[#61DAFB]' },
      { name: 'Next.js', experience: '2+ years', level: 'Advanced', progress: 88, icon: SiNextdotjs, color: 'text-foreground' },
      { name: 'TypeScript', experience: '2+ years', level: 'Advanced', progress: 82, icon: SiTypescript, color: 'text-[#3178C6]' },
      { name: 'Tailwind CSS', experience: '3+ years', level: 'Expert', progress: 95, icon: SiTailwindcss, color: 'text-[#06B6D4]' },
      { name: 'JavaScript', experience: '4+ years', level: 'Expert', progress: 96, icon: SiJavascript, color: 'text-[#F7DF1E]' },
    ],
  },
  {
    title: 'Backend & Databases',
    accent: 'from-slate-500 to-indigo-400',
    skills: [
      { name: 'Node.js', experience: '2+ years', level: 'Intermediate', progress: 70, icon: SiNodedotjs, color: 'text-[#339933]' },
      { name: 'Express.js', experience: '2+ years', level: 'Advanced', progress: 85, icon: SiExpress, color: 'text-foreground' },
      { name: 'MongoDB', experience: '2+ years', level: 'Intermediate', progress: 72, icon: SiMongodb, color: 'text-[#47A248]' },
      { name: 'PostgreSQL', experience: '2+ years', level: 'Intermediate', progress: 60, icon: SiPostgresql, color: 'text-[#4169E1]' },
      { name: 'Supabase', experience: '1 year', level: 'Beginner', progress: 42, icon: SiSupabase, color: 'text-foreground' },
      { name: 'MySQL', experience: '2+ years', level: 'Advanced', progress: 78, icon: SiMysql, color: 'text-[#4479A1]' },
      { name: 'Python', experience: '2+ years', level: 'Intermediate', progress: 74, icon: SiPython, color: 'text-[#3776AB]' },
    ],
  },
  {
    title: 'Tools & Design',
    accent: 'from-orange-500 to-yellow-400',
    skills: [
      { name: 'Git & GitHub', experience: '4+ years', level: 'Advanced', progress: 92, icon: SiGithub, color: 'text-foreground' },
      { name: 'Figma', experience: '2+ years', level: 'Intermediate', progress: 74, icon: SiFigma, color: 'text-[#F24E1E]' },
      { name: 'Canva', experience: '3+ years', level: 'Expert', progress: 90, icon: SiCanva, color: 'text-[#00C4CC]' },
      { name: 'Cursor AI', experience: '1+ year', level: 'Advanced', progress: 85, icon: CursorIcon, color: '' },
      { name: 'Vite', experience: '1+ years', level: 'Advanced', progress: 86, icon: SiVite, color: 'text-[#646CFF]' },
      { name: 'Responsive Design', experience: '3+ years', level: 'Expert', progress: 95, icon: Smartphone, color: 'text-slate-500' },
    ],
  },
];

const levelStyles = {
  Expert: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Advanced: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  Intermediate: 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400',
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
    <div id="about" className="bg-white dark:bg-[oklch(0.13_0.028_261.692)] text-foreground px-6 pt-20 md:pt-32 pb-0 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Heading */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariant}
          className="mb-16"
        >
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 uppercase">About Me</h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-brand mx-auto rounded-full"
          ></motion.div>
        </motion.div>

        {/* Biography Content */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-6 text-lg leading-relaxed mb-20"
        >
          <motion.p variants={fadeInVariant} className='text-muted-foreground'>
            I am a self-motivated <span className="text-foreground font-semibold underline underline-offset-4 decoration-brand/30">Full-Stack Developer</span> dedicated 
            to the craft of building seamless, high-performance web applications. My approach to engineering 
            is driven by a core principle: I focus on writing clean, maintainable and readable code that makes 
            building and improving products feel smooth and enjoyable.
          </motion.p>

          <motion.p variants={fadeInVariant} className='text-muted-foreground'>
            I believe that great software is defined by the balance between a polished user experience and a 
            robust, scalable architecture. My technical journey is centered on mastering the modern web 
            stack, leveraging tools like <span className="text-foreground font-semibold">React.js, Tailwind CSS, Node.js, and Python</span> to 
            transform complex requirements into intuitive digital solutions.
          </motion.p>
        </motion.div>

        {/* Modern Tech Showcase Section - Hidden on TV screens */}
        <div className="min-[1920px]:hidden space-y-8 flex flex-col">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
              <h3 className="text-xs font-black tracking-[0.25em] text-muted-foreground uppercase">
               Core Technologies
             </h3>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              className="h-px grow bg-linear-to-r from-border to-transparent origin-left"
            ></motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20}}
            whileInView={{ opacity: 1, x: 0}}
            viewport={{ once: true}}
            className='relative isolate w-full mb-20'
          >
            {/* Core technology cards - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
              {coreTechnologyGroups.map((group) => (
                <motion.article
                  key={group.title}
                  whileHover={{ y: -8 }}
                  className="relative group rounded-[2rem] border border-border/50 p-8 backdrop-blur-sm transition-all hover:border-brand/30 hover:bg-card/60 shadow-lg shadow-black/5 dark:shadow-none"
                >
                  <div className="mb-8 flex items-center gap-4">
                    <div className={`h-10 w-1 rounded-full bg-linear-to-b ${group.accent} group-hover:scale-y-110 transition-transform`}></div>
                    <h4 className="text-base font-bold uppercase text-foreground">{group.title}</h4>
                  </div>

                  <div className="space-y-6">
                    {group.skills.map((skill) => {
                      const Icon = skill.icon;
                      return (
                        <div key={skill.name} className="group/skill">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 dark:bg-muted/10 border border-border/50 group-hover/skill:border-brand/30 transition-colors">
                                <Icon size={18} className={`${skill.color} transition-transform group-hover/skill:scale-110`} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-foreground">{skill.name}</p>
                                <p className="text-[11px] font-medium text-muted-foreground">{skill.experience}</p>
                              </div>
                            </div>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${levelStyles[skill.level]}`}>
                              {skill.level}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted/50 dark:bg-muted/10 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                              className={`h-full rounded-full bg-linear-to-r ${group.accent}`}
                            ></motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>

        {/* IconCloud - Only visible on TV/large screens */}
        <div className="hidden min-[1920px]:block relative w-full h-[600px]">
          <IconCloud images={images} techData={techStack} />
        </div>

      </div>
    </div>
  );
};

export default AboutPage;

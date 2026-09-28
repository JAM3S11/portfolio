import React from 'react';
import { Mail, Github, Linkedin, ArrowRight, ArrowDownToLine, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
  { name: 'GitHub', icon: Github, url: import.meta.env.VITE_GITHUB_URL },
  { name: 'LinkedIn', icon: Linkedin, url: import.meta.env.VITE_LINKEDIN_URL },
  { name: 'Email', icon: Mail, url: 'mailto:jdndirangu2020@gmail.com' },
];

// Key facts shown under the intro, sourced from the Experience and Projects sections
const details = [
  { label: 'Currently', value: 'Founder & Engineer', sub: 'SOLEASE', href: '#projects' },
  { label: 'Previously', value: 'Software Developer Intern', sub: 'Enmowe Technologies', href: '#experience' },
  { label: 'Stack', value: 'React · Node.js', sub: 'TypeScript · PostgreSQL' },
  { label: 'Based in', value: 'Kenya', sub: 'UTC+3 · Open to remote' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const HomePage = () => {
  return (
    <section id="home" className="bg-background">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="max-w-3xl mx-auto px-5 sm:px-6 pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-44 md:pb-32"
      >
        {/* Identity: photo sits beside the name on every screen size */}
        <motion.div variants={fadeUp} className="flex items-center gap-4 sm:gap-7 mb-8 sm:mb-12">
          <img
            src="/PASSPORTJDG.png"
            alt="James Daniel"
            className="h-20 w-20 sm:h-34 sm:w-34 shrink-0 rounded-full object-cover bg-muted ring-1 ring-border ring-offset-2 sm:ring-offset-4 ring-offset-background"
          />
          <div className="min-w-0 space-y-1.5 sm:space-y-2.5">
            <p className="text-xl sm:text-3xl font-semibold tracking-tight text-foreground">James Daniel</p>
            <p className="font-mono text-xs sm:text-sm leading-snug text-muted-foreground">
              Full-Stack Engineer <span className="text-border">/</span>{' '}
              <span className="whitespace-nowrap">Founder @ SOLEASE</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-500/15 active:bg-green-500/20 transition-colors"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>
                Available for work
              </a>
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs text-muted-foreground">
                <MapPin size={11} />
                Kenya · UTC+3
              </span>
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-[2.125rem] sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] text-balance text-foreground mb-5 sm:mb-6"
        >
          Full-stack engineer building reliable products,{' '}
          <span className="text-muted-foreground">from database to interface.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="max-w-xl text-[15px] sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-8 sm:mb-10"
        >
          I design APIs, data models and the interfaces on top of them, and I care about clean,
          maintainable code. Right now I'm building{' '}
          <a
            href="#projects"
            className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
          >
            SOLEASE
          </a>
          , an agentic operations platform.
        </motion.p>

        {/* Actions: full-width stack on phones, inline row from sm up */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-x-6 sm:gap-y-4 mb-12 sm:mb-20"
        >
          <a
            href="#projects"
            className="group inline-flex h-12 sm:h-auto w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-foreground text-background px-5 sm:py-2.5 text-[15px] sm:text-sm font-medium hover:opacity-90 active:scale-[0.98] transition"
          >
            View my work
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="/JAMES_DANIEL_CV.pdf"
            download="James_Daniel_CV.pdf"
            className="inline-flex h-12 sm:h-auto w-full sm:w-auto items-center justify-center gap-1.5 rounded-full border border-border sm:border-0 text-[15px] sm:text-sm font-medium text-foreground sm:text-muted-foreground hover:text-foreground active:scale-[0.98] transition"
          >
            <ArrowDownToLine size={15} />
            <span className="sm:hidden">Download resume</span>
            <span className="hidden sm:inline">Resume</span>
          </a>

          <span className="hidden sm:block h-4 w-px bg-border" />

          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-1 pt-2 sm:pt-0">
            {socialLinks.map(({ name, icon: Icon, url }) => (
              <a
                key={name}
                href={url}
                target={url?.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={name}
                title={name}
                className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border sm:border-0 text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted transition-colors"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl sm:rounded-xl border border-border bg-border"
        >
          {details.map(({ label, value, sub, href }) => {
            const Wrapper = href ? 'a' : 'div';
            return (
              <Wrapper
                key={label}
                {...(href && { href })}
                className="flex flex-col gap-0.5 sm:gap-1 bg-background p-4 sm:p-5 hover:bg-muted/40 active:bg-muted/60 transition-colors"
              >
                <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  {label}
                </p>
                <p className="text-[13px] sm:text-sm font-medium leading-snug text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </Wrapper>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HomePage;

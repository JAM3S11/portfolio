import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Newest first
const experiences = [
  {
    period: 'Mar 2026 — Now',
    role: 'Founder & Full-Stack Product Engineer',
    company: 'SOLEASE',
    current: true,
    description:
      'Took SOLEASE from idea to a working product, owning the roadmap, architecture and release cycle while building every layer of the platform.',
    highlights: [
      'Built frontend, APIs, auth and database modules for user workflows, admin operations and reporting',
      'Integrated an AI assistant and automation features for support and operational visibility',
      'Shipped OAuth sign-in, profile management and validated upload handling',
    ],
    tech: ['TypeScript', 'Supabase', 'Clerk', 'Tailwind v4'],
  },
  {
    period: 'Jan — Apr 2026',
    role: 'Software Developer Intern',
    company: 'Enmowe Technologies (now Zunu eMobility)',
    description:
      'Turned real user pain points in finance workflows into production-ready UX improvements, with a focus on reliable, keyboard-first interactions.',
    highlights: [
      'Built dependable UI behaviour for dynamic, keyboard-driven interfaces',
      'Wrote safe, maintainable frontend logic using idempotent scripts and scoped selectors',
      'Iterated through code review to harden edge cases and improve usability',
    ],
    tech: ['JavaScript', 'HTML', 'CSS'],
  },
  {
    period: 'Apr — Aug 2023',
    role: 'Software Development Attachment',
    company: 'Ministry of ICT & the Digital Economy',
    description:
      'Built a web-based IT support ticketing system connecting a responsive frontend to a secure database backend for interdepartmental support.',
    highlights: [
      'Implemented role-based access control and secure authentication',
      'Debugged and resolved logic bottlenecks in the service desk module',
      'Translated stakeholder requirements into a dark-mode-ready interface',
    ],
    tech: ['PHP', 'MySQL', 'Bootstrap', 'AJAX'],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const ExperiencePage = () => {
  const timelineRef = useRef(null);

  // Progress through the timeline drives the line fill and the glowing dot
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 65%', 'end 50%'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const dotTop = useTransform(progress, [0, 1], ['0%', '100%']);

  return (
    <section id="experience" className="relative bg-background text-foreground px-6 py-24 md:py-32 overflow-hidden">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16 md:mb-20"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Where it all started
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-wide">
            Engineered{' '}
            <span className="italic bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600 dark:from-sky-400 dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent pr-1">
              Growth
            </span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative flex gap-6 md:gap-14">

          {/* Rail: faint base line, gradient fill and a dot that track scroll */}
          <div className="relative w-3 shrink-0 flex justify-center">
            <div className="absolute inset-y-0 w-px bg-border" />
            <motion.div
              style={{ scaleY: progress }}
              className="absolute inset-y-0 w-[2px] origin-top rounded-full bg-linear-to-b from-cyan-400 via-sky-500 to-brand"
            />
            <motion.div
              style={{ top: dotTop }}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            >
              <span className="absolute h-12 w-12 rounded-full bg-cyan-500/25 blur-md" />
              <span className="relative h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8]" />
            </motion.div>
          </div>

          {/* Entries */}
          <div className="flex-1 divide-y divide-border">
            {experiences.map((exp) => (
              <motion.article
                key={exp.company}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="grid md:grid-cols-[0.9fr_1.1fr] gap-5 md:gap-10 py-10 first:pt-0 last:pb-0"
              >
                {/* Left: period, role, company */}
                <motion.div variants={fadeUp}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                      {exp.period}
                    </span>
                    {exp.current && (
                      <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-green-600 dark:text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Current
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold leading-snug text-foreground">
                    {exp.role}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-cyan-600 dark:text-cyan-400">
                    {exp.company}
                  </p>
                </motion.div>

                {/* Right: summary, highlights, tech */}
                <motion.div variants={fadeUp} className="space-y-4">
                  <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                    {exp.description}
                  </p>
                  <ul className="space-y-2">
                    {exp.highlights.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ul className="flex flex-wrap gap-2 pt-1">
                    {exp.tech.map((t) => (
                      <li
                        key={t}
                        className="rounded-md border border-border bg-card/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperiencePage;

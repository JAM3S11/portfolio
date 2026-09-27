import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Layers, Target, Rocket, Sparkles } from 'lucide-react';
import {
  SiReact, SiJavascript, SiTypescript, SiTailwindcss, SiNextdotjs, SiFramer,
  SiNodedotjs, SiExpress, SiPython, SiPhp,
  SiPostgresql, SiSupabase, SiMongodb, SiMysql, SiFirebase,
  SiGithub, SiDocker, SiVercel, SiPostman, SiVite, SiFigma,
} from 'react-icons/si';
import { cn } from '@/lib/utils';

const principles = [
  {
    icon: Code2,
    title: 'Clean, maintainable code',
    desc: 'Readable code with clear boundaries, so products stay easy to build on and improve.',
  },
  {
    icon: Layers,
    title: 'End-to-end ownership',
    desc: 'From data models and APIs to auth and the interface, I take features across the whole stack.',
  },
  {
    icon: Target,
    title: 'Product-minded',
    desc: 'I start from real user pain points and balance a polished UX with a sound architecture.',
  },
  {
    icon: Rocket,
    title: 'Ship, then iterate',
    desc: 'Release early, learn from review and usage, and refine edge cases until it feels right.',
  },
];

// `color` is the brand color shown on hover; omitted for monochrome logos
const stackGroups = [
  {
    label: 'Frontend',
    items: [
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'Next.js', icon: SiNextdotjs },
      { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
      { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
      { name: 'Framer Motion', icon: SiFramer, color: '#0055FF' },
    ],
  },
  {
    label: 'Backend',
    items: [
      { name: 'Node.js', icon: SiNodedotjs, color: '#5FA04E' },
      { name: 'Express', icon: SiExpress },
      { name: 'Python', icon: SiPython, color: '#3776AB' },
      { name: 'PHP', icon: SiPhp, color: '#777BB4' },
    ],
  },
  {
    label: 'Data',
    items: [
      { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
      { name: 'Supabase', icon: SiSupabase, color: '#3ECF8E' },
      { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
      { name: 'MySQL', icon: SiMysql, color: '#4479A1' },
      { name: 'Firebase', icon: SiFirebase, color: '#FFCA28' },
    ],
  },
  {
    label: 'Tooling',
    items: [
      { name: 'GitHub', icon: SiGithub },
      { name: 'Docker', icon: SiDocker, color: '#2496ED' },
      { name: 'Vercel', icon: SiVercel },
      { name: 'Postman', icon: SiPostman, color: '#FF6C37' },
      { name: 'Vite', icon: SiVite, color: '#646CFF' },
      { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
      { name: 'Cursor AI', icon: Sparkles },
    ],
  },
];

// Sponsor-style logo strip. The list is rendered twice so the loop is seamless;
// hovering pauses it and reveals each logo's brand color.
const Marquee = ({ items, duration = 40, reverse = false }) => (
  <div
    style={{ '--duration': `${duration}s` }}
    className="group flex overflow-hidden [--gap:3rem] gap-(--gap) [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
  >
    {[0, 1].map((copy) => (
      <ul
        key={copy}
        aria-hidden={copy === 1 ? true : undefined}
        className={cn(
          'flex shrink-0 items-center gap-(--gap) animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none',
          reverse && '[animation-direction:reverse]'
        )}
      >
        {items.map(({ name, icon: Icon, color }) => (
          <li
            key={name}
            style={color ? { '--brand-color': color } : undefined}
            className="group/logo flex items-center gap-2.5 text-muted-foreground opacity-70 hover:opacity-100 hover:text-foreground transition"
          >
            <Icon
              size={26}
              className={color ? 'transition-colors group-hover/logo:text-(--brand-color)' : undefined}
            />
            <span className="text-base md:text-lg font-semibold tracking-tight whitespace-nowrap">{name}</span>
          </li>
        ))}
      </ul>
    ))}
  </div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const inView = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-80px' } };

const AboutPage = () => {
  return (
    <section id="about" className="bg-background text-foreground px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">

        {/* Heading + bio */}
        <motion.div {...inView} variants={stagger} className="grid md:grid-cols-[1fr_1.3fr] gap-8 md:gap-16 mb-20">
          <motion.div variants={fadeUp}>
            <p className="font-mono text-xs uppercase tracking-wider text-brand mb-4">01 — About</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
              Engineering with the product in mind.
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-5 text-base md:text-lg leading-relaxed text-muted-foreground">
            <p>
              I'm a <span className="text-foreground font-medium">Full-Stack Engineer</span> who
              enjoys the whole journey of a product: shaping the data model, designing the API and
              crafting an interface people actually like using.
            </p>
            <p>
              I started out building an IT support ticketing system with PHP and MySQL at the
              Ministry of ICT, then sharpened my frontend engineering on finance workflows at Enmowe
              Technologies. Today I'm founding{' '}
              <span className="text-foreground font-medium">SOLEASE</span>, where I own everything
              from architecture and auth to AI features and releases.
            </p>
          </motion.div>
        </motion.div>

        {/* Principles */}
        <motion.div {...inView} variants={stagger} className="mb-20">
          <motion.p variants={fadeUp} className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-6">
            How I work
          </motion.p>
          <div className="grid sm:grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
            {principles.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="group bg-background p-6 md:p-8 hover:bg-muted/40 transition-colors"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground group-hover:text-brand group-hover:border-brand/40 transition-colors">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stack */}
        <motion.div {...inView} variants={stagger}>
          <motion.p variants={fadeUp} className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-6">
            Tools &amp; technologies
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="rounded-xl border border-border bg-card/30 py-8 md:py-10 space-y-6 md:space-y-8"
          >
            <Marquee items={[...stackGroups[0].items, ...stackGroups[1].items]} duration={45} />
            <Marquee items={[...stackGroups[2].items, ...stackGroups[3].items]} duration={50} reverse />

            {/* Category legend */}
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-6 pt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {stackGroups.map(({ label, items }) => (
                <li key={label}>
                  {label} <span className="text-foreground">{items.length}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutPage;

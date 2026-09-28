import React, { useState } from 'react';
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
    className="group flex overflow-hidden [--gap:2rem] sm:[--gap:3rem] gap-(--gap) [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
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
            className="group/logo flex items-center gap-2 sm:gap-2.5 text-muted-foreground opacity-80 sm:opacity-70 hover:opacity-100 hover:text-foreground transition"
          >
            {/* Icons size from font-size (1em), so they scale with the breakpoint */}
            <Icon
              size="1em"
              className={cn(
                'shrink-0 text-xl sm:text-[26px]',
                color && 'transition-colors group-hover/logo:text-(--brand-color)'
              )}
            />
            <span className="text-sm sm:text-base md:text-lg font-semibold tracking-tight whitespace-nowrap">{name}</span>
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
  const [activeCard, setActiveCard] = useState(0);

  // Track which principle card is snapped into view on the mobile carousel
  const handleCarouselScroll = (e) => {
    const el = e.currentTarget;
    const card = el.firstElementChild;
    if (!card) return;
    const step = card.getBoundingClientRect().width + 12; // card width + gap-3
    setActiveCard(Math.min(principles.length - 1, Math.round(el.scrollLeft / step)));
  };

  return (
    <section id="about" className="bg-background text-foreground px-5 sm:px-6 py-16 sm:py-24 md:py-32">
      <div className="max-w-5xl mx-auto">

        {/* Heading + bio */}
        <motion.div {...inView} variants={stagger} className="grid md:grid-cols-[1fr_1.3fr] gap-5 sm:gap-8 md:gap-16 mb-14 sm:mb-20">
          <motion.div variants={fadeUp}>
            <p className="font-mono text-xs uppercase tracking-wider text-brand mb-3 sm:mb-4">01 — About</p>
            <h2 className="text-[1.75rem] sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-balance">
              Engineering with the product in mind.
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4 sm:space-y-5 text-[15px] sm:text-base md:text-lg leading-relaxed text-muted-foreground">
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
        <motion.div {...inView} variants={stagger} className="mb-14 sm:mb-20">
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-4 sm:mb-6">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">How I work</p>
            <p className="sm:hidden font-mono text-[11px] text-muted-foreground">
              {String(activeCard + 1).padStart(2, '0')} / {String(principles.length).padStart(2, '0')}
            </p>
          </motion.div>

          {/* Swipeable carousel on phones, hairline 2×2 grid from sm up */}
          <div
            onScroll={handleCarouselScroll}
            className={cn(
              'flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-5 -mx-5 px-5 pb-1',
              '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              'sm:grid sm:grid-cols-2 sm:gap-px sm:overflow-hidden sm:mx-0 sm:px-0 sm:pb-0 sm:rounded-xl sm:border sm:border-border sm:bg-border'
            )}
          >
            {principles.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="group w-[82%] shrink-0 snap-start rounded-2xl border border-border bg-card/40 p-5 sm:w-auto sm:rounded-none sm:border-0 sm:bg-background sm:p-6 md:p-8 hover:bg-muted/40 transition-colors"
              >
                <div className="mb-4 sm:mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground group-hover:text-brand group-hover:border-brand/40 transition-colors">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5 sm:mb-2">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Position dots (mobile only) */}
          <div className="sm:hidden mt-4 flex justify-center gap-1.5" aria-hidden="true">
            {principles.map((p, i) => (
              <span
                key={p.title}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === activeCard ? 'w-5 bg-brand' : 'w-1.5 bg-border'
                )}
              />
            ))}
          </div>
        </motion.div>

        {/* Stack */}
        <motion.div {...inView} variants={stagger}>
          <motion.p variants={fadeUp} className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4 sm:mb-6">
            Tools &amp; technologies
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="-mx-5 sm:mx-0 border-y sm:border border-border sm:rounded-xl bg-card/30 py-6 sm:py-8 md:py-10 space-y-5 sm:space-y-6 md:space-y-8"
          >
            <Marquee items={[...stackGroups[0].items, ...stackGroups[1].items]} duration={45} />
            <Marquee items={[...stackGroups[2].items, ...stackGroups[3].items]} duration={50} reverse />

            {/* Category legend */}
            <ul className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2 px-5 sm:px-6 pt-1 sm:pt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
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

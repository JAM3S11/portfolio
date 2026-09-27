import React, { useState, useRef, useLayoutEffect } from 'react';
import { Github, ArrowUpRight, ArrowRight, Code2, Server, Layers, FileCode, BookOpen } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
];

const categoryMeta = {
  fullstack: { label: 'Full-Stack', icon: Layers },
  frontend: { label: 'Frontend', icon: Code2 },
  backend: { label: 'Backend', icon: Server },
};

const statusStyles = {
  Live: 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400',
  Building: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400',
  'In progress': 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Archived: 'border-border bg-muted text-muted-foreground',
};

// Curated order: flagship first. `github`/`live` are null when there is nothing public to link.
const projects = [
  {
    title: 'SOLEASE',
    tagline: 'Engineering operations platform',
    description:
      'An engineering operations platform I founded and build end to end, now being rebuilt as an agentic operating system for teams.',
    highlights: [
      'AI assistant and automation for support and operational visibility',
      'OAuth sign-in, profiles and role-based experiences',
      'Admin operations and reporting modules',
    ],
    tech: ['TypeScript', 'Supabase', 'Clerk', 'Tailwind v4'],
    github: 'https://github.com/JAM3S11/solease.git',
    live: null,
    image: 'https://ik.imagekit.io/jimdanliveurl/solease.png',
    status: 'Building',
    category: 'fullstack',
    hasTests: true,
    hasDocs: true,
  },
  {
    title: 'EntryWave',
    tagline: 'Event experience portal',
    description:
      'More than an invitation: a full event experience portal designed for the Kenyan market and the flagship of a longer-term EntryWave platform.',
    highlights: [
      'Immersive, interactive experience for modern celebrations',
      'Node.js and Firebase backend for event data',
      'Test coverage on core flows',
    ],
    tech: ['TypeScript', 'Tailwind', 'Node.js', 'Firebase'],
    github: 'https://github.com/JAM3S11/entrywave.git',
    live: 'https://entrywave.vercel.app',
    image: 'https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-06-13%20224656.png',
    status: 'Live',
    category: 'fullstack',
    hasTests: true,
    hasDocs: false,
  },
  {
    title: 'Greatwall',
    tagline: 'AI × Web3 energy protocol',
    description:
      'A sovereign energy protocol merging AI and Web3 to decentralise the power grid and bring transparency to the Kenyan energy sector.',
    highlights: [
      'Web3.js integration for on-chain transparency',
      'AI-driven view of grid efficiency',
      'Animated, responsive product site',
    ],
    tech: ['React', 'Tailwind', 'Headless UI', 'Framer Motion', 'Web3.js'],
    github: 'https://github.com/JAM3S11/greatwall.git',
    live: 'https://greatwallhub.vercel.app/',
    image: 'https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-04-18%20210209.png',
    status: 'In progress',
    category: 'fullstack',
    hasTests: false,
    hasDocs: false,
  },
  {
    title: 'Wantach Workflow',
    tagline: 'n8n-style automation diagram',
    description:
      'An interactive, n8n-style workflow diagram of the end-to-end business registration process for RegEase Kenya.',
    highlights: [
      'Maps client intake and document validation',
      'Visualises government portal integration',
      'Covers payment automation end to end',
    ],
    tech: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Lucide React'],
    github: 'https://github.com/JAM3S11/regease-workflow.git',
    live: 'https://wantach-workflow.vercel.app',
    image: 'https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-04-18%20212549.png',
    status: 'Live',
    category: 'frontend',
    hasTests: false,
    hasDocs: false,
  },
  {
    title: 'Open Weather',
    tagline: 'Real-time weather dashboard',
    description:
      'A real-time weather app built on a REST API, focused on accurate data and clean, readable visualisation.',
    highlights: [
      'Live data fetched from the OpenWeather REST API',
      'Accessible UI components with Headless UI',
      'Clear, glanceable data layout',
    ],
    tech: ['React', 'Tailwind', 'Headless UI', 'Axios'],
    github: null,
    live: 'https://openweatherapidemo.vercel.app/',
    image: 'https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-01-06%20154823.png',
    status: 'Live',
    category: 'frontend',
    hasTests: false,
    hasDocs: false,
  },
  {
    title: 'Franatech',
    tagline: 'Corporate landing page',
    description:
      'A professional landing page for a technical services company, built for conversion and fast, responsive performance.',
    highlights: [
      'Conversion-focused layout and messaging',
      'Fully responsive across devices',
      'Lightweight vanilla HTML, CSS and JavaScript',
    ],
    tech: ['HTML', 'CSS', 'JavaScript'],
    github: 'https://github.com/JAM3S11/franatech-website-template.git',
    live: 'https://franatech-website-template.vercel.app/',
    image: 'https://ik.imagekit.io/jimdanliveurl/Screenshot%202026-04-18%20210031.png',
    status: 'Live',
    category: 'frontend',
    hasTests: false,
    hasDocs: false,
  },
  {
    title: 'eTicketing',
    tagline: 'IT service desk platform',
    description:
      'A server-side IT support system that streamlines the ticket lifecycle and collaboration between departments.',
    highlights: [
      'End-to-end ticket lifecycle management',
      'Role-based access control and secure authentication',
      'AJAX-driven updates without page reloads',
    ],
    tech: ['PHP', 'MySQL', 'Bootstrap', 'AJAX'],
    github: 'https://github.com/JAM3S11/eticketing.git',
    live: null,
    image: null,
    status: 'Archived',
    category: 'backend',
    hasTests: false,
    hasDocs: false,
  },
];

const countFor = (id) => (id === 'all' ? projects.length : projects.filter((p) => p.category === id).length);

const ProjectDetails = ({ project }) => {
  const { icon: Icon, label } = categoryMeta[project.category];

  return (
    <motion.div
      key={project.title}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-medium', statusStyles[project.status])}>
            {project.status}
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <Icon size={12} />
            {label}
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{project.title}</h3>
        <p className="mt-1 text-sm font-medium text-cyan-600 dark:text-cyan-400">{project.tagline}</p>
      </div>

      <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{project.description}</p>

      <div className="space-y-2.5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Highlights</p>
        {project.highlights.map((item) => (
          <div key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
            <ArrowRight size={14} className="mt-0.5 shrink-0 text-cyan-500" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            {t}
          </span>
        ))}
        {project.hasTests && (
          <span className="flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[11px] font-medium text-green-600 dark:text-green-400">
            <FileCode size={12} /> Tests
          </span>
        )}
        {project.hasDocs && (
          <span className="flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">
            <BookOpen size={12} /> Docs
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-brand hover:text-white transition-colors"
          >
            Live demo
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-brand/50 transition-colors"
          >
            <Github size={15} />
            Source
          </a>
        )}
        {!project.live && !project.github && (
          <span className="text-sm text-muted-foreground">Private project</span>
        )}
      </div>
    </motion.div>
  );
};

const ProjectCard = ({ project, selected, wide, onSelect, cardRef }) => (
  <motion.button
    ref={cardRef}
    type="button"
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    onClick={onSelect}
    aria-pressed={selected}
    aria-label={`Show details for ${project.title}`}
    className={cn(
      'group relative overflow-hidden rounded-2xl border text-left bg-card transition-[border-color,box-shadow,opacity] duration-300',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
      wide ? 'sm:col-span-2 aspect-[16/8]' : 'aspect-[16/11]',
      selected
        ? 'border-cyan-500/60 shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_12px_40px_-12px_rgba(56,189,248,0.45)]'
        : 'border-border opacity-70 hover:opacity-100 hover:border-foreground/20'
    )}
  >
    {project.image ? (
      <img
        src={project.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted to-background">
        <span className="font-mono text-2xl font-bold tracking-tight text-muted-foreground/60">{project.title}</span>
      </div>
    )}

    {/* Caption */}
    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-4 pt-10">
      <p className="text-sm font-semibold text-white">{project.title}</p>
      <p className="text-xs text-white/70">{project.tagline}</p>
    </div>

    {selected && (
      <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" />
    )}
  </motion.button>
);

const ProjectsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTitle, setSelectedTitle] = useState(projects[0].title);

  const railRef = useRef(null);
  const detailsRef = useRef(null);
  const cardRefs = useRef({});

  // Rail dot position (px from top of the rail), eased with a spring
  const dotTarget = useMotionValue(0);
  const dotY = useSpring(dotTarget, { stiffness: 220, damping: 28 });

  const filtered = activeFilter === 'all' ? projects : projects.filter((p) => p.category === activeFilter);
  const selected = projects.find((p) => p.title === selectedTitle);

  // Keep the glowing dot level with the selected card
  useLayoutEffect(() => {
    const align = () => {
      const card = cardRefs.current[selectedTitle];
      const rail = railRef.current;
      if (!card || !rail) return;
      const c = card.getBoundingClientRect();
      const r = rail.getBoundingClientRect();
      dotTarget.set(c.top - r.top + c.height / 2);
    };
    align();
    // Re-align once the grid's layout animation has settled
    const timer = setTimeout(align, 350);
    window.addEventListener('resize', align);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', align);
    };
  }, [selectedTitle, activeFilter, dotTarget]);

  const handleFilter = (id) => {
    setActiveFilter(id);
    const next = id === 'all' ? projects : projects.filter((p) => p.category === id);
    if (!next.some((p) => p.title === selectedTitle)) setSelectedTitle(next[0].title);
  };

  const handleSelect = (title) => {
    setSelectedTitle(title);
    // On stacked layouts the details sit above the grid, so bring them into view
    if (window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="projects" className="bg-background text-foreground px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Where ideas become systems
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-wide">
            Product{' '}
            <span className="italic bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600 dark:from-sky-400 dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent pr-1">
              Builds
            </span>
          </h2>
        </motion.div>

        {/* Filters */}
        <div className="flex justify-center mb-12 md:mb-16">
          <div role="tablist" aria-label="Filter projects" className="isolate inline-flex flex-wrap justify-center gap-1 rounded-full border border-border bg-muted/40 p-1">
            {categories.map((cat) => {
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleFilter(cat.id)}
                  className={cn(
                    'relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="project-filter"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-full bg-background shadow-sm ring-1 ring-border"
                    />
                  )}
                  {cat.label}
                  <span className="font-mono text-[11px] text-muted-foreground">{countFor(cat.id)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6">

          {/* Left: details of the selected project */}
          <div ref={detailsRef} className="lg:col-span-4 scroll-mt-28">
            <div className="lg:sticky lg:top-28">
              <AnimatePresence mode="wait">
                <ProjectDetails key={selected.title} project={selected} />
              </AnimatePresence>
            </div>
          </div>

          {/* Middle: glowing rail whose node follows the selected card */}
          <div ref={railRef} className="hidden lg:flex lg:col-span-1 relative justify-center" aria-hidden="true">
            <div className="absolute inset-y-0 w-px bg-border" />
            <div className="absolute inset-y-0 w-[1.5px] bg-linear-to-b from-cyan-400/80 via-sky-500/40 to-transparent" />
            <motion.div style={{ y: dotY }} className="absolute top-0 left-1/2 -translate-x-1/2">
              <div className="relative -translate-y-1/2 flex items-center justify-center">
                <span className="absolute h-10 w-10 rounded-full bg-cyan-500/30 blur-md" />
                <span className="relative h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_15px_#38bdf8]" />
              </div>
            </motion.div>
          </div>

          {/* Right: selectable project previews */}
          <motion.div layout className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.title}
                project={project}
                selected={project.title === selectedTitle}
                wide={i === 0 && filtered.length % 2 === 1}
                onSelect={() => handleSelect(project.title)}
                cardRef={(el) => { cardRefs.current[project.title] = el; }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsPage;

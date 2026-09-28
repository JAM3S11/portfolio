import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { Github, ArrowUpRight, ArrowRight, Code2, Server, Layers, FileCode, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBodyScrollLock, useViewport } from '@/hooks';

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

const ProjectDetails = ({ project, showActions = true }) => {
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

      {showActions && <ProjectActions project={project} className="pt-2" />}
    </motion.div>
  );
};

// Live demo / Source buttons. `block` makes them equal-width for the mobile sheet footer.
const ProjectActions = ({ project, block = false, className }) => (
  <div className={cn('flex items-center gap-3', block ? 'w-full' : 'flex-wrap', className)}>
    {project.live && (
      <a
        href={project.live}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'group inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-brand hover:text-white active:scale-[0.98] transition',
          block ? 'h-12 flex-1' : 'px-5 py-2.5'
        )}
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
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-brand/50 active:scale-[0.98] transition',
          block ? 'h-12 flex-1' : 'px-5 py-2.5'
        )}
      >
        <Github size={15} />
        Source
      </a>
    )}
    {!project.live && !project.github && (
      <span className={cn('text-sm text-muted-foreground', block && 'w-full text-center py-3')}>Private project</span>
    )}
  </div>
);

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
      'group relative overflow-hidden rounded-2xl border text-left bg-card transition-[border-color,box-shadow,opacity,transform] duration-300 active:scale-[0.985]',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
      wide ? 'sm:col-span-2 aspect-[16/10] sm:aspect-[16/8]' : 'aspect-[16/10] sm:aspect-[16/11]',
      // Selection only means something on desktop, where details sit beside the grid
      selected
        ? 'border-border lg:border-cyan-500/60 lg:shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_12px_40px_-12px_rgba(56,189,248,0.45)]'
        : 'border-border lg:opacity-70 hover:opacity-100 hover:border-foreground/20'
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

    {/* Status pill (mobile/tablet; desktop shows status in the details column) */}
    <span className="lg:hidden absolute top-3 left-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
      {project.status}
    </span>

    {/* Caption */}
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/85 via-black/40 to-transparent p-4 pt-10">
      <div className="min-w-0">
        <p className="truncate text-[15px] sm:text-sm font-semibold text-white">{project.title}</p>
        <p className="truncate text-xs text-white/70">{project.tagline}</p>
      </div>
      <span className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md">
        <ArrowUpRight size={16} />
      </span>
    </div>

    {selected && (
      <span className="hidden lg:block absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" />
    )}
  </motion.button>
);

// Mobile/tablet bottom sheet with the full project details.
// Drag the handle (or swipe the header) down to dismiss; the body scrolls independently.
const ProjectSheet = ({ project, onClose }) => {
  const dragControls = useDragControls();

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} details`}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
        className="fixed inset-x-0 bottom-0 z-[81] flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-border bg-card shadow-2xl lg:hidden sm:mx-auto sm:max-w-xl sm:border-x"
      >
        {/* Drag handle + close */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="relative shrink-0 cursor-grab touch-none px-5 pt-3 pb-2 active:cursor-grabbing"
        >
          <div className="mx-auto h-1.5 w-10 rounded-full bg-border" />
          <button
            type="button"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Close details"
            className="absolute right-3 top-2 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
          <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
            {project.image ? (
              <img src={project.image} alt={`${project.title} screenshot`} className="h-full w-full object-cover object-top" />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-xl font-bold text-muted-foreground/60">
                {project.title}
              </div>
            )}
          </div>
          <ProjectDetails project={project} showActions={false} />
        </div>

        {/* Pinned actions */}
        <div className="shrink-0 border-t border-border bg-card/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <ProjectActions project={project} block />
        </div>
      </motion.div>
    </>
  );
};

const ProjectsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTitle, setSelectedTitle] = useState(projects[0].title);
  const [sheetOpen, setSheetOpen] = useState(false);

  // The sheet only exists below lg, so treat it as closed on desktop widths
  const isDesktop = useViewport(1024);
  const showSheet = sheetOpen && !isDesktop;
  useBodyScrollLock(showSheet);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const railRef = useRef(null);
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
    // Below lg there is no details column, so open the bottom sheet instead
    if (window.innerWidth < 1024) setSheetOpen(true);
  };

  return (
    <section id="projects" className="bg-background text-foreground px-5 sm:px-6 py-16 sm:py-24 md:py-32">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Where ideas become systems
          </p>
          <h2 className="text-[2rem] leading-tight sm:text-4xl md:text-5xl font-extrabold uppercase tracking-normal sm:tracking-wide">
            Product{' '}
            <span className="italic bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600 dark:from-sky-400 dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent pr-1">
              Builds
            </span>
          </h2>
        </motion.div>

        {/* Filters: one scrollable row on phones instead of wrapping */}
        <div className="-mx-5 sm:mx-0 mb-8 sm:mb-12 md:mb-16 flex overflow-x-auto px-5 sm:px-0 sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div role="tablist" aria-label="Filter projects" className="isolate mx-auto inline-flex shrink-0 flex-nowrap gap-1 rounded-full border border-border bg-muted/40 p-1">
            {categories.map((cat) => {
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleFilter(cat.id)}
                  className={cn(
                    'relative flex shrink-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full px-3.5 sm:px-4 py-2 sm:py-1.5 text-sm font-medium transition-colors',
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

          {/* Left: details of the selected project (desktop only; phones use the sheet) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28">
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
          <motion.div layout className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 content-start">
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

      <AnimatePresence>
        {showSheet && <ProjectSheet key={selected.title} project={selected} onClose={closeSheet} />}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsPage;

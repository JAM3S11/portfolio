import React, { useState } from 'react';
import { ArrowUp, ArrowUpRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const linkGroups = [
  {
    title: 'Navigate',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Experience', href: '#experience' },
      { label: 'Projects', href: '#projects' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'GitHub', href: import.meta.env.VITE_GITHUB_URL, external: true },
      { label: 'LinkedIn', href: import.meta.env.VITE_LINKEDIN_URL, external: true },
      { label: 'WhatsApp', href: import.meta.env.VITE_WHATSAPP_URL, external: true },
      { label: 'Email', href: 'mailto:jdndirangu2020@gmail.com' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Resume (PDF)', href: '/JAMES_DANIEL_CV.pdf', download: 'James_Daniel_CV.pdf' },
      { label: 'SOLEASE', href: '#projects' },
    ],
  },
];

const Footer = () => {
  const year = new Date().getFullYear();
  // Mobile accordion: one group open at a time. From sm up every group is always visible.
  const [openGroup, setOpenGroup] = useState('Navigate');

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-12 sm:pt-16 pb-6 sm:pb-8">

        {/* Top: brand + link columns */}
        <div className="grid gap-8 sm:gap-12 md:grid-cols-[1.4fr_2fr]">
          <div className="max-w-xs">
            <a href="#home" className="inline-flex items-center gap-2.5">
              <img src="/PASSPORTJDG.png" alt="" className="h-9 w-9 sm:h-8 sm:w-8 rounded-full object-cover ring-1 ring-border" />
              <span className="text-base font-bold tracking-tight text-foreground">
                JDG<span className="text-brand">.</span>
              </span>
            </a>
            <p className="mt-4 text-[15px] sm:text-sm leading-relaxed text-muted-foreground">
              Full-stack engineer building reliable products, from database to interface.
            </p>
            <a
              href="#contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 sm:py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 active:bg-muted transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Available for new work
            </a>
          </div>

          <nav
            aria-label="Footer"
            className="divide-y divide-border border-y border-border sm:divide-y-0 sm:border-0 sm:grid sm:grid-cols-3 sm:gap-8"
          >
            {linkGroups.map((group) => {
              const isOpen = openGroup === group.title;
              const panelId = `footer-${group.title.toLowerCase()}`;

              return (
                <div key={group.title}>
                  {/* Accordion header on phones, plain label from sm up */}
                  <button
                    type="button"
                    onClick={() => setOpenGroup(isOpen ? null : group.title)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="sm:hidden flex w-full min-h-[52px] items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground active:text-foreground"
                  >
                    {group.title}
                    <ChevronDown size={16} className={cn('transition-transform duration-300', isOpen && 'rotate-180')} />
                  </button>
                  <p className="hidden sm:block mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </p>

                  <div
                    id={panelId}
                    className={cn(
                      'grid transition-[grid-template-rows] duration-300 ease-out sm:grid-rows-[1fr]',
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    )}
                  >
                    <ul className="overflow-hidden sm:space-y-2.5">
                      {group.links.map(({ label, href, external, download }) => (
                        <li key={label}>
                          <a
                            href={href}
                            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                            {...(download && { download })}
                            className="group flex sm:inline-flex min-h-11 sm:min-h-0 items-center justify-between sm:justify-start gap-1 text-[15px] sm:text-sm text-foreground/80 hover:text-foreground active:text-foreground transition-colors"
                          >
                            {label}
                            {external && (
                              <ArrowUpRight
                                size={14}
                                className="text-muted-foreground transition-all sm:opacity-0 sm:-translate-x-1 sm:group-hover:opacity-100 sm:group-hover:translate-x-0"
                              />
                            )}
                          </a>
                        </li>
                      ))}
                      {/* Breathing room under the last link while open on phones */}
                      <li aria-hidden="true" className="h-3 sm:hidden" />
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 sm:mt-16 flex items-center justify-between gap-4 sm:border-t sm:border-border sm:pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            © {year} James Daniel.
            <span className="hidden sm:inline"> Built with React, Vite &amp; Tailwind CSS.</span>
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group inline-flex h-10 sm:h-auto shrink-0 items-center gap-1.5 rounded-full border border-border px-4 sm:px-3 sm:py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 active:bg-muted transition-colors"
          >
            Back to top
            <ArrowUp size={13} className="transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
        <p className="sm:hidden mt-2 text-[11px] text-muted-foreground/80">Built with React, Vite &amp; Tailwind CSS.</p>
      </div>

      {/* Oversized wordmark fading into the page edge.
          Extra bottom space on phones keeps it clear of the floating chat launcher. */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none px-5 sm:px-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0 sm:-mb-[0.2em]"
      >
        <p className="max-w-6xl mx-auto text-center font-extrabold uppercase leading-none tracking-tighter whitespace-nowrap text-[11vw] lg:text-[8.5rem] bg-linear-to-b from-foreground/10 to-transparent bg-clip-text text-transparent">
          James Daniel
        </p>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { ArrowUp, ArrowUpRight } from 'lucide-react';

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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">

        {/* Top: brand + link columns */}
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div className="max-w-xs">
            <a href="#home" className="inline-flex items-center gap-2.5">
              <img src="/James.png" alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-border" />
              <span className="text-base font-bold tracking-tight text-foreground">
                JDG<span className="text-brand">.</span>
              </span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Full-stack engineer building reliable products, from database to interface.
            </p>
            <a
              href="#contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Available for new work
            </a>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                <ul className="space-y-2.5">
                  {group.links.map(({ label, href, external, download }) => (
                    <li key={label}>
                      <a
                        href={href}
                        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                        {...(download && { download })}
                        className="group inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground transition-colors"
                      >
                        {label}
                        {external && (
                          <ArrowUpRight
                            size={13}
                            className="text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                          />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col-reverse gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} James Daniel. Built with React, Vite &amp; Tailwind CSS.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
          >
            Back to top
            <ArrowUp size={13} className="transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Oversized wordmark fading into the page edge */}
      <div aria-hidden="true" className="pointer-events-none select-none px-6 -mb-[0.2em]">
        <p className="max-w-6xl mx-auto text-center font-extrabold uppercase leading-none tracking-tighter whitespace-nowrap text-[11vw] lg:text-[8.5rem] bg-linear-to-b from-foreground/10 to-transparent bg-clip-text text-transparent">
          James Daniel
        </p>
      </div>
    </footer>
  );
};

export default Footer;

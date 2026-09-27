import React from 'react';

const Logo = () => {
  return (
    <a
      href="#home"
      className="flex items-center gap-2.5 group rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      aria-label="James Daniel, back to top"
    >
      <span className="relative h-8 w-8 shrink-0 rounded-full ring-2 ring-brand/20 group-hover:ring-brand/60 transition-all duration-200">
        <img src="/PASSPORTJDG.png" alt="" className="h-full w-full rounded-full object-cover" />
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
      </span>
      <span className="text-base font-bold tracking-tight text-foreground">
        JDG<span className="text-brand">.</span>
        <span className="hidden lg:inline font-mono text-xs font-normal text-muted-foreground ml-1.5">
          /dev
        </span>
      </span>
    </a>
  );
};

export default Logo;

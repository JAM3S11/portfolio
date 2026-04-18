import React from 'react';

const Logo = () => {
  return (
    <a
      href="#home"
      className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
      aria-label="JDG Portfolio Home"
    >
      <div className="flex md:hidden h-8 w-8 items-center justify-center rounded bg-linear-to-br from-blue-500 to-blue-700 text-white font-mono font-bold text-xs group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all duration-200">
        {"</>"}
      </div>
      <div className="hidden md:flex h-10 w-10 items-center justify-center rounded bg-linear-to-br from-blue-500 to-blue-700 text-white font-mono font-bold text-sm group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all duration-200">
        {"</>"}
      </div>
      <span className="sm:inline text-lg font-bold tracking-tight dark:text-white">
        JDG
      </span>
      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-border bg-muted/50 font-mono text-[10px] text-muted-foreground ml-1">
        v1.0
      </span>
    </a>
  );
};

export default Logo;

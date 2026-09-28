import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

// Top bar for each admin page: title on the left, page-specific actions on the right
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

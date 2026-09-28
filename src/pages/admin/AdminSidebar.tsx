import type { ReactNode } from 'react';
import {
  Inbox, Activity, BarChart3, Bell, ArrowUpRight, LogOut, PanelLeftClose, PanelLeftOpen, Search, Keyboard,
} from 'lucide-react';
import { MOD_KEY } from './shortcuts';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/common/components/ThemeToggle';

export type AdminSection = 'messages' | 'monitor' | 'analytics' | 'alerts';

interface AdminSidebarProps {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Conversations with activity since they were last opened */
  unreadConversations: number;
  totalConversations: number;
  unacknowledgedAlerts: number;
  isLive: boolean;
  onViewSite: () => void;
  onSignOut: () => void;
  onOpenPalette: () => void;
  onShowShortcuts: () => void;
}

const NAV: { id: AdminSection; label: string; icon: typeof Inbox }[] = [
  { id: 'messages', label: 'Inbox', icon: Inbox },
  { id: 'monitor', label: 'Monitor', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

export default function AdminSidebar({
  active,
  onNavigate,
  collapsed,
  onToggleCollapsed,
  unreadConversations,
  totalConversations,
  unacknowledgedAlerts,
  isLive,
  onViewSite,
  onSignOut,
  onOpenPalette,
  onShowShortcuts,
}: AdminSidebarProps) {
  // Right-hand indicator for each nav item
  const indicator = (id: AdminSection): ReactNode => {
    if (id === 'messages') {
      if (unreadConversations > 0) return <Badge tone="brand">{unreadConversations}</Badge>;
      return totalConversations > 0 ? <Badge tone="muted">{totalConversations}</Badge> : null;
    }
    if (id === 'alerts' && unacknowledgedAlerts > 0) return <Badge tone="danger">{unacknowledgedAlerts}</Badge>;
    if (id === 'monitor' && isLive) {
      return (
        <span className="relative flex h-2 w-2" aria-label="Live">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      );
    }
    return null;
  };

  return (
    <aside
      className={cn(
        'flex-shrink-0 flex flex-col bg-card border-r border-border transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand */}
      <div className={cn('flex h-14 items-center border-b border-border', collapsed ? 'justify-center' : 'gap-2.5 px-4')}>
        <img src="/PASSPORTJDG.png" alt="" className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border" />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-bold tracking-tight text-foreground">
              JDG<span className="text-brand">.</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Admin console</p>
          </div>
        )}
      </div>

      {/* Primary navigation */}
      <nav aria-label="Admin" className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* Command palette entry point */}
        <button
          onClick={onOpenPalette}
          title={collapsed ? `Search (${MOD_KEY} K)` : undefined}
          aria-label={collapsed ? 'Open command palette' : undefined}
          className={cn(
            'mb-2 flex w-full items-center rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors',
            collapsed ? 'h-10 justify-center' : 'h-9 gap-2.5 px-3'
          )}
        >
          <Search size={15} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search…</span>
              <kbd className="rounded border border-border px-1.5 font-mono text-[10px]">{MOD_KEY} K</kbd>
            </>
          )}
        </button>
        {!collapsed && (
          <p className="px-3 pt-2 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
            Workspace
          </p>
        )}
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const badge = indicator(id);
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? label : undefined}
              className={cn(
                'relative flex w-full items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand',
                collapsed ? 'h-10 justify-center' : 'h-9 gap-3 px-3',
                isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-brand" aria-hidden="true" />}
              <Icon size={17} className={cn('shrink-0', isActive && 'text-brand')} />
              {!collapsed && <span className="flex-1 text-left">{label}</span>}
              {badge && (collapsed ? <span className="absolute right-1.5 top-1.5">{badge}</span> : badge)}
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="border-t border-border p-2 space-y-0.5">
        <div className={cn('flex items-center', collapsed ? 'flex-col gap-0.5' : 'justify-between px-1')}>
          {!collapsed && (
            <span className="flex items-center gap-1.5 px-2 text-[11px] text-muted-foreground">
              <span className={cn('h-1.5 w-1.5 rounded-full', isLive ? 'bg-green-500' : 'bg-amber-500')} />
              {isLive ? 'Connected' : 'Demo mode'}
            </span>
          )}
          <ThemeToggle size={16} />
        </div>
        <SidebarButton icon={Keyboard} label="Shortcuts" collapsed={collapsed} onClick={onShowShortcuts} hint="?" />
        <SidebarButton icon={ArrowUpRight} label="View site" collapsed={collapsed} onClick={onViewSite} />
        <SidebarButton icon={LogOut} label="Sign out" collapsed={collapsed} onClick={onSignOut} />
        <SidebarButton
          icon={collapsed ? PanelLeftOpen : PanelLeftClose}
          label={collapsed ? 'Expand sidebar' : 'Collapse'}
          collapsed={collapsed}
          onClick={onToggleCollapsed}
        />
      </div>
    </aside>
  );
}

function SidebarButton({
  icon: Icon,
  label,
  collapsed,
  onClick,
  hint,
}: {
  icon: typeof Inbox;
  label: string;
  collapsed: boolean;
  onClick: () => void;
  /** Keyboard hint shown on the right when expanded */
  hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        'flex w-full items-center rounded-lg text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors',
        collapsed ? 'h-10 justify-center' : 'h-9 gap-3 px-3'
      )}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span className="flex-1 text-left">{label}</span>}
      {!collapsed && hint && <kbd className="rounded border border-border px-1.5 font-mono text-[10px]">{hint}</kbd>}
    </button>
  );
}

function Badge({ tone, children }: { tone: 'brand' | 'muted' | 'danger'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'min-w-5 rounded-full px-1.5 py-px text-center text-[10px] font-semibold tabular-nums',
        tone === 'brand' && 'bg-brand text-white',
        tone === 'muted' && 'bg-muted text-muted-foreground',
        tone === 'danger' && 'bg-red-500 text-white'
      )}
    >
      {children}
    </span>
  );
}

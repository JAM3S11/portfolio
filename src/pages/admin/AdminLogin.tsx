import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, Inbox, BarChart3, Bell, ArrowRight, KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLoginProps {
  password: string;
  onPasswordChange: (v: string) => void;
  remember: boolean;
  onRememberChange: (v: boolean) => void;
  isLoading: boolean;
  /** Inline error from the last attempt */
  error: string | null;
  /** Seconds left before another attempt is allowed (after repeated failures) */
  lockedSeconds: number;
  /** No Supabase configured: the dashboard shows sample data */
  isDemo: boolean;
  onLogin: () => void;
  onBack: () => void;
}

const FEATURES = [
  { icon: Inbox, title: 'Inbox', text: 'Read chats from the portfolio assistant and reply live.' },
  { icon: BarChart3, title: 'Analytics', text: 'Response times, answer quality and what visitors ask about.' },
  { icon: Bell, title: 'Alerts', text: 'Know when answers slow down or something goes wrong.' },
];

export default function AdminLogin({
  password,
  onPasswordChange,
  remember,
  onRememberChange,
  isLoading,
  error,
  lockedSeconds,
  isDemo,
  onLogin,
  onBack,
}: AdminLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const locked = lockedSeconds > 0;

  const detectCaps = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.('CapsLock') ?? false);

  return (
    <div className="grid min-h-dvh bg-background text-foreground lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Soft glow + faint grid, echoing the portfolio */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-brand/15 blur-[110px]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <img src="/PASSPORTJDG.png" alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-border" />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">
              JDG<span className="text-brand">.</span>
            </p>
            <p className="text-xs text-muted-foreground">Admin console</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Portfolio assistant</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Every conversation,{' '}
            <span className="italic bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600 dark:from-sky-400 dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent pr-1">
              one place.
            </span>
          </h1>
          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} James Daniel</p>
      </aside>

      {/* Sign-in form */}
      <main className="flex flex-col px-5 py-6 sm:px-8">
        <button
          onClick={onBack}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Back to portfolio
        </button>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-sm"
          >
            {/* Compact brand for phones */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img src="/PASSPORTJDG.png" alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-border" />
              <p className="text-sm font-bold tracking-tight">
                JDG<span className="text-brand">.</span> <span className="font-normal text-muted-foreground">Admin</span>
              </p>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Enter the admin password to open the console.</p>

            {isDemo && (
              <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                Demo mode: Supabase isn't configured, so the console shows sample data.
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!locked) onLogin();
              }}
              className="mt-7 space-y-4"
              noValidate
            >
              {/* Lets password managers file the credential under a stable account name */}
              <input type="text" name="username" autoComplete="username" value="admin" readOnly hidden />

              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">
                  Password
                </label>
                <div
                  className={cn(
                    'flex items-center rounded-xl border bg-background transition focus-within:ring-4',
                    error ? 'border-red-500/60 focus-within:ring-red-500/15' : 'border-border focus-within:border-brand/60 focus-within:ring-brand/10'
                  )}
                >
                  <KeyRound size={16} className="ml-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    onKeyUp={detectCaps}
                    onKeyDown={detectCaps}
                    autoComplete="current-password"
                    autoFocus
                    disabled={locked}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'login-error' : capsLock ? 'caps-warning' : undefined}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="mr-1.5 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div aria-live="polite" className="mt-2 min-h-5 space-y-1">
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        id="login-error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400"
                      >
                        <AlertCircle size={14} className="mt-px shrink-0" />
                        {locked ? `Too many attempts. Try again in ${lockedSeconds}s.` : error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {capsLock && !error && (
                    <p id="caps-warning" className="text-xs text-amber-700 dark:text-amber-400">Caps Lock is on.</p>
                  )}
                </div>
              </div>

              <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => onRememberChange(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[var(--color-brand)]"
                />
                Keep me signed in for 7 days
              </label>

              <button
                type="submit"
                disabled={!password.trim() || isLoading || locked}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-foreground disabled:hover:text-background transition-colors active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Checking…
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Only the site owner can sign in here. Visitors can reach James from the{' '}
              <button onClick={onBack} className="text-foreground underline underline-offset-2 hover:text-brand">
                portfolio
              </button>
              .
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

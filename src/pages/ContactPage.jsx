import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, Copy, Check, ArrowUpRight, Loader2, CheckCircle2, AlertCircle, Clock, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Whatsapp from '../assets/whatsapp.svg';
import { cn } from '@/lib/utils';

const EMAIL = 'jdndirangu2020@gmail.com';
const whatsappMessage =
  'Hello! Thank you for reaching out. What challenge can I help you solve today? Whether you have a general inquiry or need a system solution, feel free to share.';

const channels = [
  {
    name: 'LinkedIn',
    detail: 'Professional profile',
    icon: <Linkedin size={18} />,
    url: import.meta.env.VITE_LINKEDIN_URL,
  },
  {
    name: 'WhatsApp',
    detail: 'Quick chat',
    icon: <img src={Whatsapp} alt="" className="h-[18px] w-[18px] opacity-80 dark:invert" />,
    url: `${import.meta.env.VITE_WHATSAPP_URL}?text=${encodeURIComponent(whatsappMessage)}`,
  },
  {
    name: 'GitHub',
    detail: 'Code & open source',
    icon: <Github size={18} />,
    url: import.meta.env.VITE_GITHUB_URL,
  },
];

// One-tap contact options shown above the form on phones
const quickActions = [
  { name: 'Email', icon: <Mail size={16} />, url: `mailto:${EMAIL}` },
  { name: 'WhatsApp', icon: <img src={Whatsapp} alt="" className="h-4 w-4 opacity-80 dark:invert" />, url: channels[1].url, external: true },
  { name: 'LinkedIn', icon: <Linkedin size={16} />, url: import.meta.env.VITE_LINKEDIN_URL, external: true },
];

const topics = ['Full-time role', 'Freelance project', 'Collaboration', 'Just saying hi'];

const steps = [
  { title: 'Send a message', desc: 'Share a bit about the role, product or idea.' },
  { title: 'I reply within 24h', desc: 'You get a personal response, not an auto-reply.' },
  { title: 'We talk it through', desc: 'A short call to scope the next steps together.' },
];

const MESSAGE_LIMIT = 1000;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// text-base (16px) on phones stops iOS Safari zooming the page when a field is focused
const inputClass =
  'w-full rounded-xl sm:rounded-lg border border-border bg-background px-3.5 py-3 sm:py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-colors focus:outline-none focus:border-brand/60 focus:ring-4 focus:ring-brand/10';

// Current time in Nairobi, refreshed every 30s
const useLocalTime = () => {
  const format = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }).format(new Date());
  const [time, setTime] = useState(format);

  useEffect(() => {
    const id = setInterval(() => setTime(format()), 30000);
    return () => clearInterval(id);
  }, []);

  return time;
};

const ContactPage = () => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [feedback, setFeedback] = useState('');
  const [topic, setTopic] = useState(topics[0]);
  const [messageLength, setMessageLength] = useState(0);
  const [copied, setCopied] = useState(false);
  const localTime = useLocalTime();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const handleForm = async (event) => {
    event.preventDefault();
    const form = event.target;
    setStatus('loading');
    setFeedback('');

    const formData = new FormData(form);
    formData.append('access_key', import.meta.env.VITE_WEB3FORMS_COM_KEY);
    formData.append('subject', `Portfolio: ${topic} — ${formData.get('name')}`);

    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setFeedback("Thanks! Your message is in. I'll get back to you within 24 hours.");
        form.reset();
        setMessageLength(0);
        setTimeout(() => { setStatus('idle'); setFeedback(''); }, 6000);
      } else {
        setStatus('error');
        setFeedback(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setFeedback(`Couldn't send right now. Please try again or email me at ${EMAIL}.`);
    }
  };

  return (
    <section id="contact" className="relative bg-background text-foreground px-5 sm:px-6 py-16 sm:py-24 md:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-8 sm:mb-16 md:mb-20"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Let's build something
          </p>
          <h2 className="text-[2rem] leading-tight sm:text-4xl md:text-5xl font-extrabold uppercase tracking-normal sm:tracking-wide">
            Get in{' '}
            <span className="italic bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600 dark:from-sky-400 dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent pr-1">
              Touch
            </span>
          </h2>
          <p className="mt-4 sm:mt-5 max-w-xl mx-auto text-[15px] sm:text-base text-muted-foreground leading-relaxed text-balance">
            Hiring, have a product in mind, or want to collaborate? Tell me about it and I'll reply
            personally.
          </p>
        </motion.div>

        {/* Mobile quick actions: reach out in one tap before scrolling to the form */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="lg:hidden mb-8 space-y-4"
        >
          <div className="grid grid-cols-3 gap-2.5">
            {quickActions.map(({ name, icon, url, external }) => (
              <a
                key={name}
                href={url}
                {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card/50 py-4 text-xs font-medium text-foreground active:scale-[0.97] active:bg-muted transition"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                  {icon}
                </span>
                {name}
              </a>
            ))}
          </div>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Available for new work
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              <span className="font-mono">{localTime}</span> in Nairobi
            </span>
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.25fr] gap-10 lg:gap-16 items-start">

          {/* Left: direct channels + process (after the form on phones) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="order-2 lg:order-1 space-y-8 lg:space-y-10"
          >
            {/* Availability (mobile shows this above the form instead) */}
            <motion.div variants={fadeUp} className="hidden lg:flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Available for new work
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={14} />
                <span className="font-mono">{localTime}</span> in Nairobi (UTC+3)
              </span>
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeUp}>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Email</p>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/50 p-2 pl-4">
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 min-w-0 text-sm font-medium text-foreground hover:text-brand transition-colors">
                  <Mail size={16} className="shrink-0 text-muted-foreground" />
                  <span className="truncate">{EMAIL}</span>
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={copied ? 'Email copied' : 'Copy email address'}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 lg:py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground active:bg-muted transition-colors"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </motion.div>

            {/* Other channels (covered by the quick actions on phones) */}
            <motion.div variants={fadeUp} className="hidden lg:block">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Elsewhere</p>
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {channels.map((c) => (
                  <a
                    key={c.name}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 bg-background px-4 py-3.5 hover:bg-muted/40 transition-colors"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground group-hover:text-foreground transition-colors">
                      {c.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-foreground">{c.name}</span>
                      <span className="block text-xs text-muted-foreground">{c.detail}</span>
                    </span>
                    <ArrowUpRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Process */}
            <motion.div variants={fadeUp}>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-4">What happens next</p>
              <ol className="relative space-y-5 border-l border-border pl-6">
                {steps.map((step, i) => (
                  <li key={step.title} className="relative">
                    <span className="absolute -left-[33px] flex h-4 w-4 items-center justify-center rounded-full border border-cyan-500/50 bg-background font-mono text-[9px] text-cyan-600 dark:text-cyan-400">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </li>
                ))}
              </ol>
            </motion.div>
          </motion.div>

          {/* Right: form (first on phones) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative order-1 lg:order-2"
          >
            <div className="absolute -inset-3 sm:-inset-6 -z-10 rounded-[2rem] bg-linear-to-br from-cyan-500/10 via-brand/10 to-transparent blur-2xl" />

            <form
              onSubmit={handleForm}
              className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 sm:p-6 md:p-8 shadow-xl shadow-black/5 space-y-5"
            >
              {/* Honeypot for spam bots (Web3Forms) */}
              <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

              <div>
                <h3 className="text-lg font-semibold text-foreground">Send a message</h3>
                <p className="text-sm text-muted-foreground">All fields are required.</p>
              </div>

              {/* Topic */}
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-foreground">What's this about?</legend>
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <label
                      key={t}
                      className={cn(
                        'cursor-pointer rounded-full border px-3.5 py-2 sm:py-1.5 text-[13px] sm:text-xs font-medium transition-colors active:scale-[0.97] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40',
                        topic === t
                          ? 'border-brand/60 bg-brand/10 text-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                      )}
                    >
                      <input
                        type="radio"
                        name="topic"
                        value={t}
                        checked={topic === t}
                        onChange={() => setTopic(t)}
                        className="sr-only"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-foreground">
                    Name
                  </label>
                  <input id="contact-name" name="name" type="text" required autoComplete="name" enterKeyHint="next" placeholder="Jane Doe" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input id="contact-email" name="email" type="email" inputMode="email" required autoComplete="email" autoCapitalize="none" enterKeyHint="next" placeholder="jane@company.com" className={inputClass} />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                    Message
                  </label>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {messageLength}/{MESSAGE_LIMIT}
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  maxLength={MESSAGE_LIMIT}
                  onChange={(e) => setMessageLength(e.target.value.length)}
                  placeholder="A few lines about the role, project or idea, timelines and anything I should know."
                  className={cn(inputClass, 'resize-none')}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={cn(
                  'group flex h-12 sm:h-auto w-full items-center justify-center gap-2 rounded-xl sm:rounded-lg sm:py-3 text-[15px] sm:text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70',
                  status === 'success'
                    ? 'bg-green-600 text-white'
                    : 'bg-foreground text-background hover:bg-brand hover:text-white'
                )}
              >
                {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
                {status === 'success' && <CheckCircle2 size={16} />}
                {(status === 'idle' || status === 'error') && (
                  <Send size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
                {status === 'loading' ? 'Sending…' : status === 'success' ? 'Message sent' : 'Send message'}
              </button>

              <div aria-live="polite" className="min-h-5">
                <AnimatePresence>
                  {feedback && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'flex items-start gap-2 text-sm',
                        status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      )}
                    >
                      {status === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
                      {feedback}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <p className="border-t border-border pt-4 text-xs text-muted-foreground">
                Your details are only used to reply to you. No newsletters, no spam.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;

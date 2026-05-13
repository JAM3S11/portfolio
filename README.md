# Portfolio Website

A modern, interactive portfolio website showcasing my work as a **Full-Stack Engineer**. Built with **React 19**, **Vite 7**, and **Tailwind CSS v4**, featuring an **AI-powered chat assistant**, smooth animations, dark mode, and a full **admin dashboard** with analytics.

## 🚀 Features

### Core
- **AI Chat Assistant** — Floating chat widget powered by **Google Gemini 2.0 Flash** with FAQ knowledge base, deep-dive technical analysis, and interview practice mode
- **Admin Dashboard** — Password-protected panel with real-time conversation viewer, intent analytics, 7-day activity charts, and CSV export
- **Dark Mode** — Toggle between light and dark themes with localStorage persistence + system preference detection
- **Interactive Hero** — Typing animation on name, interactive SVG grid background, role badge with animated ping
- **Tech Marquee** — Auto-scrolling showcase of 19 technologies with hover-pause and tooltips
- **Experience Timeline** — Animated vertical timeline with spring-loaded dots and scroll-triggered reveals
- **Project Showcase** — Filterable project grid (All / Frontend / Backend / Full-Stack) with 7 projects, hover overlays, status badges, code quality indicators
- **Contact Form** — Dual integration with **Web3Forms API** + **Supabase** for reliable message delivery
- **Smooth Navigation** — Hash-based anchor scrolling with fixed header, scroll progress bar, and responsive mobile menu
- **Scroll-to-Top** — Floating button with smooth scroll and fade animation

### Interactive Components
- **Interactive Grid Pattern** — SVG grid with hover-reactive squares on the hero section
- **3D Icon Cloud** — Interactive sphere of orbiting tech icons (behind a refactor flag)
- **Gravity Stars Background** — Interactive starfield with gravitational pull effect
- **Animated List** — Stack-to-list morphing animation component
- **Particle System** — tsParticles integration (snow/stars/floating variants)
- **Cloud Orbit** — Orbiting image gallery component

### AI Chat System
- **5 Quick Action buttons**: Hiring/Job, Project Quote, Tech Inquiry, Partnership, General FAQ
- **4 Deep Dive Insight buttons**: Frontend, Backend, Fullstack, Software Engineering
- **FAQ Knowledge Base**: 40+ keyword-matched responses covering skills, projects, contact, career advice, pricing
- **Google Gemini 2.0 Flash**: AI-powered responses for unmatched queries with portfolio context
- **Deep Dive Mode**: Specialized technical analysis per focus area with project architecture details
- **Interview Practice Mode**: Full technical interview simulation with role-based questions, difficulty levels, and AI-generated feedback
- **Supabase persistence**: Creates conversations, stores messages with visitor intent, real-time subscriptions
- **Graceful degradation**: Falls back to demo mode when Supabase is not configured

### Admin Dashboard
- **Password-protected login** with Supabase-backed settings or default env var password
- **3-column layout**: Conversation list (searchable, filterable) | Chat viewer with quick replies | Analytics panel
- **Real-time subscriptions** via Supabase Realtime for new conversations
- **Analytics**: Stats cards (Conversations, Messages, Bot Efficiency %, Active count), 7-day activity bar chart, intent breakdown, AI Assistant update cards
- **CSV export** of conversation data
- **Demo mode** with 5 mock conversations when Supabase is unavailable

## 🛠️ Tech Stack

### Frontend
- **React 19** — Latest React with concurrent features
- **Vite 7** — Fast build tool and dev server with HMR
- **Tailwind CSS v4** — Utility-first CSS framework with `@import "tailwindcss"` syntax
- **Framer Motion** — Production animation library for page transitions, scroll reveals, hover effects
- **React Router v7** — Client-side routing with hash-based anchor navigation
- **Lucide React** — Beautiful, consistent icon library
- **Headless UI** — Accessible, unstyled UI primitives
- **React Icons** — Tech brand icons (React, TypeScript, Node.js, etc.) for tech marquee
- **tsParticles** — Particle animation backgrounds (snow, stars, floating particles)
- **Class Variance Authority** — Utility for creating component variants with Tailwind
- **clsx + tailwind-merge** — Conditional class merging via `cn()` utility

### AI & Backend
- **Google Gemini AI** — `@google/generative-ai` SDK for AI chat responses, deep-dive analysis, interview practice
- **Supabase** — Backend-as-a-Service for chat persistence, real-time subscriptions, admin settings, contact storage
- **Web3Forms** — Contact form API integration as primary submission channel
- **TypeScript** — Type-safe chat system, services, and admin dashboard

### Development
- **ESLint** — Flat config with React Hooks and React Refresh plugins
- **jsconfig.json** — `@/` path alias for clean imports
- **Vercel** — Deployment with SPA rewrite rules via `vercel.json`

## 📁 Project Structure

```
PORTFOLIO/
├── .env                              # Environment variables (API keys, URLs)
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
├── SUPABASE_SETUP.md                 # Supabase schema setup guide
├── components.json                   # shadcn/ui + Magic UI + Animate UI configuration
├── eslint.config.js                  # Flat ESLint config
├── index.html                        # HTML entry point with Inter font
├── jsconfig.json                     # @/ path alias config
├── package.json                      # Dependencies and scripts
├── vercel.json                       # Vercel SPA rewrite rules
├── vite.config.js                    # Vite + React + Tailwind + @ alias
│
├── public/
│   ├── JD.svg                        # Favicon (JD initials)
│   ├── JAMES_DANIEL_CV.pdf           # Downloadable CV
│   └── googleefc393199fcb06a4.html   # Google Search Console verification
│
└── src/
    ├── main.jsx                      # Entry point (BrowserRouter)
    ├── App.jsx                       # Root component with routing
    ├── index.css                     # Global styles + Tailwind v4 + CSS variables
    │
    ├── assets/                       # Images and SVGs
    │   ├── jdhub.png                 # Social/preview image
    │   └── whatsapp.svg              # WhatsApp icon for contact
    │
    ├── common/                       # Shared layout components
    │   ├── Header.jsx                # Fixed header with scroll effects & progress bar
    │   ├── Footer.jsx                # Footer with copyright + GitHub credit
    │   ├── ScrollToTop.jsx           # Floating scroll-to-top button
    │   ├── typing-animation.jsx      # Typewriter effect component
    │   └── components/
    │       ├── index.js              # Barrel exports
    │       ├── Logo.jsx              # JDG logo with version badge
    │       ├── DesktopNav.jsx        # Desktop nav + theme toggle + CTA
    │       ├── MobileNav.jsx         # Full-screen mobile menu with spring animations
    │       └── ThemeToggle.jsx       # Sun/Moon theme toggle button
    │
    ├── components/
    │   ├── ui/                       # Interactive components
    │   │   ├── interactive-grid-pattern.jsx  # SVG grid with hover-reactive squares
    │   │   ├── particles.jsx                 # tsParticles wrapper (3 variants)
    │   │   ├── animated-list.jsx             # Stack-to-list morphing animation
    │   │   ├── icon-cloud.jsx                # Interactive 3D icon sphere
    │   │   └── cloud-orbit.jsx               # Orbiting image gallery
    │   ├── chat/
    │   │   └── ChatWidget.tsx                # Floating AI chat widget (410 lines)
    │   └── animate-ui/
    │       └── components/backgrounds/
    │           └── gravity-stars.jsx         # Interactive gravity starfield
    │
    ├── content/
    │   └── ThemeProvider.jsx         # Theme context + localStorage persistence
    │
    ├── hooks/
    │   ├── useScroll.js              # Scroll threshold detection
    │   ├── useScrollDirection.js     # Scroll direction (up/down)
    │   ├── useScrollProgress.js      # Page scroll progress (0-100%)
    │   ├── useViewport.js            # Responsive breakpoint detection
    │   └── useBodyScrollLock.js      # Lock body scroll for mobile menu
    │
    ├── lib/
    │   ├── utils.js                  # cn() utility (clsx + tailwind-merge)
    │   ├── chat-service.ts           # Supabase CRUD for chat + realtime subscriptions
    │   ├── faq-knowledge.ts          # FAQ knowledge base (40+ keyword-matched responses)
    │   ├── gemini-service.ts         # Google Gemini AI integration
    │   ├── interview-service.ts      # Technical interview practice system
    │   └── project-knowledge.ts      # Deep technical project data (7 projects, 979 lines)
    │
    └── pages/
        ├── HomePage.jsx              # Hero with typing animation + grid background
        ├── AboutPage.jsx             # Bio + tech marquee with 19 technologies
        ├── ExperiencePage.jsx        # Timeline with animated line + dots
        ├── ProjectsPage.jsx          # Filterable project cards with animated grid
        ├── ContactPage.jsx           # Contact form + social links
        └── AdminDashboard.tsx        # Admin panel (conversations + analytics, 883 lines)
```

## 🎯 Sections

1. **Home** — Hero section with typewriter name effect, role badge, tech stack badge, interactive grid background, social links, and CTA buttons (Download CV, View Projects)
2. **About** — Personal bio with highlighted keywords, auto-scrolling tech marquee (19 technologies with hover tooltips), gradient fade edges
3. **Experience** — Animated timeline with pulsating dot, experience card (Ministry Of Information, Communication and The Digital Economy), responsibility points with hover effects
4. **Projects** — Filterable grid (All / Frontend / Backend / Full-Stack) with 7 projects featuring image overlays, status badges, GitHub/demo links, tech tags, code quality indicators
5. **Contact** — Two-column layout: contact info + social links (GitHub, LinkedIn, WhatsApp) and contact form with Web3Forms API, loading/success/error states

## 🧩 Custom Hooks

| Hook | Purpose |
|------|---------|
| `useScroll` | Detects scroll position threshold (returns `scrolled` boolean) |
| `useScrollDirection` | Tracks scroll direction (`up` / `down`) |
| `useScrollProgress` | Returns scroll progress as a 0-1 ratio |
| `useViewport` | Returns current viewport width and responsive breakpoint |
| `useBodyScrollLock` | Locks/unlocks body scroll (used for mobile menu) |

## 🤖 AI Chat Architecture

The chat widget uses a **layered response system**:

1. **FAQ Knowledge Base** (`faq-knowledge.ts`) — 40+ keyword-matched responses for common queries about skills, projects, contact info, career advice, pricing
2. **Google Gemini 2.0 Flash** (`gemini-service.ts`) — AI-powered fallback for unmatched queries, using full portfolio context + project data as system prompt
3. **Deep Dive Mode** — Specialized prompts per focus area with detailed project technical context
4. **Interview Practice Mode** (`interview-service.ts`) — Full technical interview simulation with role-based questions, difficulty levels, and AI-generated feedback

All conversations are optionally persisted to **Supabase** with real-time subscriptions for the admin dashboard.

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_GITHUB_URL=https://github.com/JAM3S11
VITE_LINKEDIN_URL=https://www.linkedin.com/in/james-daniel-jr/
VITE_WHATSAPP_URL=https://wa.me/+254716041419
VITE_WEB3FORMS_COM_KEY=your_web3forms_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ADMIN_PASSWORD=admin123
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📝 Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_GITHUB_URL` | Your GitHub profile URL |
| `VITE_LINKEDIN_URL` | Your LinkedIn profile URL |
| `VITE_WHATSAPP_URL` | Your WhatsApp contact URL |
| `VITE_WEB3FORMS_COM_KEY` | Web3Forms API key ([get one here](https://web3forms.com)) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_GEMINI_API_KEY` | Google Gemini AI API key |
| `VITE_ADMIN_PASSWORD` | Admin dashboard fallback password (default: `admin123`) |

## 🎨 Customization

### Updating Personal Information

1. **Home Page**: Edit `src/pages/HomePage.jsx` — hero text, name, role, social links
2. **About Page**: Modify `src/pages/AboutPage.jsx` — biography, tech stack marquee items
3. **Experience**: Update entries in `src/pages/ExperiencePage.jsx` — job title, company, dates, responsibilities
4. **Projects**: Add/modify projects in `src/pages/ProjectsPage.jsx` — images, descriptions, tech stacks, links
5. **Contact**: Update contact info in `src/pages/ContactPage.jsx` — email, phone, social URLs
6. **Project Knowledge**: Update detailed project data in `src/lib/project-knowledge.ts` for AI context
7. **FAQ Knowledge**: Modify responses in `src/lib/faq-knowledge.ts`

### Styling

The project uses **Tailwind CSS v4** with CSS custom properties for theming. Design tokens are defined in `src/index.css` using the `@theme inline` directive. Customize colors, spacing, and other tokens there or directly in component classes.

### Theme

Dark mode is managed through `src/content/ThemeProvider.jsx`. The theme preference:
1. Reads from `localStorage` on load
2. Falls back to `prefers-color-scheme: dark` media query
3. Persists `isDarkMode` boolean to localStorage on toggle
4. Toggles `dark` class on `document.documentElement`

## 📱 Responsive Design

The portfolio is fully responsive and optimized for:
- **Mobile** (320px+) — Hamburger menu, single-column layouts
- **Tablets** (768px+) — Two-column layouts, visible navigation
- **Desktops** (1024px+) — Full multi-column layouts, hover effects
- **Large screens** (1440px+) — Max-width containers, spacious layouts

### Animation Strategy

- **Entry animations**: Framer Motion `whileInView` with `viewport={{ once: true }}` for performance
- **Staggered children**: Section items animate sequentially with 0.1-0.2s delays
- **GPU-composited properties**: Prefers `transform` and `opacity` for smooth 60fps animations
- **Hover effects**: translateY, scale, color transitions on cards, buttons, and links
- **Scroll progress**: Real-time header progress bar reflecting page scroll position

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

The project is configured for **Vercel** deployment with SPA rewrite rules in `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

## 👤 Author

**James Daniel** — Full-Stack Engineer

- Email: [jdndirangu2020@gmail.com](mailto:jdndirangu2020@gmail.com)
- Phone: [+254 716 041419](tel:+254716041419)
- GitHub: [@JAM3S11](https://github.com/JAM3S11)
- LinkedIn: [James Daniel Jr.](https://www.linkedin.com/in/james-daniel-jr/)
- Portfolio: [jamesdaniel.dev](https://jamesdaniel.dev)

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) — Blazing fast build tool
- [React](https://react.dev/) — UI framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) — Animation library
- [Google Gemini AI](https://deepmind.google/technologies/gemini/) — AI assistant
- [Supabase](https://supabase.com/) — Backend-as-a-Service
- [Web3Forms](https://web3forms.com/) — Contact form handling
- [Lucide](https://lucide.dev/) — Beautiful icons
- [Headless UI](https://headlessui.com/) — Accessible components
- [tsParticles](https://www.npmjs.com/package/@tsparticles/react) — Particle effects
- [Magic UI](https://magicui.design/) — Component inspiration
- [Animate UI](https://animate-ui.com/) — Animation components

---

⭐ If you like this project, please give it a star on [GitHub](https://github.com/JAM3S11/PORTFOLIO)!

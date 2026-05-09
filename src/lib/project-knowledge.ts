export interface TechDetail {
  name: string;
  purpose: string;
}

export interface DesignDecision {
  decision: string;
  rationale: string;
  tradeoffs: string;
}

export interface Challenge {
  problem: string;
  solution: string;
  impact: string;
}

export interface FrontendDetail {
  stateManagement: string;
  componentArchitecture: string;
  renderingStrategy: string;
  stylingApproach: string;
  accessibilityNotes: string;
}

export interface BackendDetail {
  apiDesign: string;
  databaseSchema: string;
  authStrategy: string;
  securityConsiderations: string[];
  errorHandling: string;
}

export interface DevOpsDetail {
  deployment: string;
  ciCd: string;
  environmentConfig: string;
}

export interface ProjectTechnicalDetail {
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack';
  status: string;
  techStack: TechDetail[];
  architecture: string;
  designDecisions: DesignDecision[];
  challenges: Challenge[];
  codeQuality: {
    hasTests: boolean;
    hasDocs: boolean;
    notableGaps: string[];
  };
  frontendDetails: FrontendDetail;
  backendDetails: BackendDetail;
  devopsDetails: DevOpsDetail;
  whatILearned: string[];
  interviewFocusAreas: {
    frontend: string[];
    backend: string[];
    fullstack: string[];
    software: string[];
  };
  repoUrl: string;
  liveUrl: string;
}

export const PROJECTS: ProjectTechnicalDetail[] = [
  {
    name: "SOLEASE",
    description: "A full-scale ITSM platform featuring role-based access control, automated ticketing workflows, and real-time data analytics for organizational support. Built as a monorepo with separate frontend and backend directories.",
    category: "fullstack",
    status: "InProgress",
    techStack: [
      { name: "React 19", purpose: "UI framework with concurrent features" },
      { name: "Vite 7", purpose: "Fast dev server and build tool" },
      { name: "Zustand 5", purpose: "Lightweight state management (6 stores)" },
      { name: "Express 5", purpose: "Backend API framework" },
      { name: "Prisma 7", purpose: "ORM with PostgreSQL adapter" },
      { name: "PostgreSQL", purpose: "Relational database" },
      { name: "Google Gemini", purpose: "AI assistant, auto-reply, categorization" },
      { name: "MUI X-Charts", purpose: "Real-time analytics charts" },
      { name: "JWT + OAuth", purpose: "Authentication (local + Google/GitHub)" },
      { name: "Upstash Redis", purpose: "Distributed rate limiting" },
      { name: "Tailwind CSS + DaisyUI + shadcn/ui", purpose: "UI component ecosystem" },
      { name: "Nodemailer + Mailtrap", purpose: "Email verification and notifications" }
    ],
    architecture: "Monorepo with backend/ (Express 5 REST API, Prisma ORM, PostgreSQL) and frontend/ (React 19 SPA, Vite, Zustand). Routes in App.jsx use ProtectedRoute wrappers with allowedRoles arrays for role-based access. Backend follows route-controller-utility pattern with middleware chains (verifyToken, rateLimiter, upload). Legacy Mongoose models remain in src/models/ but deprecated in favor of Prisma.",
    designDecisions: [
      {
        decision: "Zustand over Redux for state management",
        rationale: "Simpler API, less boilerplate, 6 stores kept small and focused. Zustand's vanilla API allows cross-store communication without React context.",
        tradeoffs: "No devtools middleware out of the box, no standardized action patterns. Cross-store calls (e.g., authStore calling notificationStore) create implicit dependencies."
      },
      {
        decision: "PostgreSQL over MongoDB after migration",
        rationale: "MongoDB Atlas free tier auto-paused after 30 days of inactivity causing irreversible data loss. PostgreSQL via Supabase/Neon provided more reliable free tier with no data loss risk.",
        tradeoffs: "Schema migrations are more rigid, required rewriting all models from Mongoose to Prisma schema, more upfront schema design needed."
      },
      {
        decision: "Express 5 (latest major version)",
        rationale: "Wanted early access to improved async error handling, path matching, and middleware API improvements.",
        tradeoffs: "Fewer community resources, potential instability, some middleware compatibility issues."
      },
      {
        decision: "Hybrid rate limiting (local + distributed)",
        rationale: "express-rate-limit for simple per-route limits, Upstash Redis for cross-instance coordination when horizontally scaled.",
        tradeoffs: "Two systems to maintain, Redis dependency for distributed limits, added complexity for what could be a single solution."
      },
      {
        decision: "HTTP-only cookies over localStorage for JWT",
        rationale: "More secure against XSS attacks since JavaScript cannot read the token from cookies.",
        tradeoffs: "Vulnerable to CSRF (mitigated by sameSite:strict), more complex API client setup with credentials: include."
      }
    ],
    challenges: [
      {
        problem: "MongoDB Atlas auto-paused clusters caused complete data loss",
        solution: "Migrated entire database to PostgreSQL using Prisma ORM. Rewrote all models and queries. Implemented connection pooling with @prisma/adapter-pg.",
        impact: "Significant rewrite effort but resulted in more reliable data persistence and better tooling through Prisma."
      },
      {
        problem: "Several components grew to extreme sizes (228KB ClientReportPage, 128KB AdminReportPage)",
        solution: "Split by feature rather than refactoring. New features go in smaller, focused components. Legacy components remain intact.",
        impact: "Temporary technical debt — these components are difficult to test, maintain, and reason about individually."
      },
      {
        problem: "Role system was overly complex with 5 roles (Agent, IT Support, Service Desk, Client, Manager)",
        solution: "Consolidated to 3 roles: Client, Reviewer, Manager. Merged Agent/IT Support/Service Desk into Reviewer.",
        impact: "Simpler authorization logic, less confusion, but required DB migration and updating all ProtectedRoute components."
      },
      {
        problem: "No automated testing across the entire codebase",
        solution: "Project relies on manual testing. No Jest, Vitest, or Cypress configured.",
        impact: "High risk of regressions during refactoring, no CI/CD quality gates, manual QA bottleneck."
      }
    ],
    codeQuality: {
      hasTests: true,
      hasDocs: true,
      notableGaps: [
        "No unit or integration tests despite having test badges",
        "TypeScript not used — plain JSX with jsconfig aliases only",
        "No centralized error handler — inline try/catch per controller with inconsistent error formats",
        "Deprecated Mongoose models remain in codebase as dead code",
        "Extremely large component files (228KB, 128KB, 124KB)"
      ]
    },
    frontendDetails: {
      stateManagement: "Zustand with 6 domain stores (auth, ticket, notification, admin, profile, personalNote). Cross-store communication via Zustand's vanilla getState() API. Async actions use try/catch with manual set() for loading/error states.",
      componentArchitecture: "Feature-first split with shared UI components (shadcn/ui primitives). ProtectedRoute wrapper checks authentication, verification, and role. Each role has its own dashboard layout. Heavy use of shadcn sidebar, sheet, drawer, dialog primitives.",
      renderingStrategy: "SPA with client-side routing via React Router 7. Dashboard routes conditionally hide Header/Footer. IntersectionObserver for landing page section tracking.",
      stylingApproach: "Triple-stack: Tailwind CSS for utility classes, DaisyUI for component themes, shadcn/ui for Radix-based accessible primitives. Dark/light theme via next-themes with CSS variables.",
      accessibilityNotes: "Limited — shadcn/ui provides basic aria attributes. Custom components lack systematic accessibility testing. Keyboard navigation not consistently implemented."
    },
    backendDetails: {
      apiDesign: "RESTful API under /sol/ base path. Separate route files per domain (auth, admin, ticket, profile, notification, ai, oauth). ~50+ endpoints. Express 5 with route-level middleware chains. OAuth routes under /api/auth (different convention).",
      databaseSchema: "12 Prisma models: User, Ticket, Comment, Reply, Notification, PersonalNote, ChatSession, ChatMessage, Attachment, ContactUs, ContactUserProfile. Complex relationships with cascade deletes on Comment→Reply and ChatSession→ChatMessage. User has ~35 fields including presence tracking, plan tiers, AI usage counters.",
      authStrategy: "JWT in HTTP-only cookie (7-day expiry). Remember Me extends session with 30-day crypto token. Password strength enforcement with update deadlines. Email verification + admin approval flow. OAuth (Google + GitHub) as alternative auth paths.",
      securityConsiderations: [
        "HTTP-only cookies prevent XSS token theft",
        "sameSite:strict mitigates CSRF risks",
        "bcryptjs for password hashing",
        "Rate limiting on auth routes (signup, login, verify, forgot-password)",
        "No CSRF tokens — relies on sameSite only",
        "No input validation library (Joi/Zod) — manual checks in controllers",
        "Error details potentially leaked in production responses"
      ],
      errorHandling: "No centralized error middleware. Each controller has individual try/catch blocks. Error response formats are inconsistent — some return {success: false, message}, others return {error}. No global error logging middleware."
    },
    devopsDetails: {
      deployment: "Frontend builds to dist/, served by Express backend in production. Reverse proxy via nginx with SSL (Let's Encrypt). Process managed with PM2.",
      ciCd: "No CI/CD pipeline detected. No GitHub Actions, no automated deployments.",
      environmentConfig: "Environment variables for DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, REDIS_URL, CLIENT_URL, EMAIL config. .env for development."
    },
    whatILearned: [
      "Cloud database choice is critical — MongoDB Atlas free tier's auto-pausing caused irreversible data loss",
      "Role complexity should be minimized — simplified from 5 roles to 3 after discovering unnecessary overhead",
      "HTTP-only cookies are more secure than localStorage for JWTs",
      "Rate limiting needs both local and distributed approaches for production reliability",
      "AI integration needs robust fallback chains for API unavailability",
      "Express 5 adoption was premature — fewer resources and compatibility issues"
    ],
    interviewFocusAreas: {
      frontend: [
        "Zustand vs Redux trade-offs for mid-size applications",
        "Cross-store state dependencies and how to decouple them",
        "Component size anti-patterns — when to split and how",
        "Protected route implementation patterns in React Router",
        "shadcn/ui + DaisyUI dual-theme architecture decisions",
        "Dark mode implementation via next-themes and CSS variables",
        "Framer Motion integration patterns for page transitions",
        "State management for real-time features (notifications, presence)"
      ],
      backend: [
        "MongoDB to PostgreSQL migration strategy and execution",
        "Prisma ORM vs raw SQL — when each makes sense",
        "JWT + Remember Me token dual strategy design",
        "Dual rate limiting (local express-rate-limit + distributed Upstash Redis)",
        "Express 5 migration — benefits and risks",
        "Role-based authorization without centralized RBAC middleware",
        "Service layer design vs inline business logic in controllers",
        "Email verification flow design (signup → verify → admin approve)"
      ],
      fullstack: [
        "End-to-end RBAC from database schema to UI protected routes",
        "Monorepo structure — shared types, separate builds, dependency management",
        "OAuth integration (Google + GitHub) alongside local auth",
        "AI service integration with fallback chains and rate limiting",
        "File upload pipeline (Multer → storage → URL → attachment model)",
        "Real-time analytics architecture (MUI X-Charts data flow)",
        "Cookie-based auth across SPA and API — CORS, credentials, CSRF"
      ],
      software: [
        "Testing strategy for a project with zero test coverage",
        "Refactoring monolithic components (228KB files) safely",
        "Database migration from MongoDB to PostgreSQL — lessons learned",
        "TypeScript adoption strategy for a large JSX codebase",
        "Legacy code management — when to keep deprecated code vs delete",
        "Technical debt prioritization in a solo project",
        "API design consistency — why /sol/ vs /api/auth/ matters"
      ]
    },
    repoUrl: "https://github.com/JAM3S11/solease",
    liveUrl: "#"
  },
  {
    name: "Greatwall",
    description: "A sovereign energy protocol that aims to merge AI and Web3 to decentralize the power grid, enhancing transparency and efficiency in the Kenyan energy sector. Currently a front-end prototype with mock blockchain interactions.",
    category: "fullstack",
    status: "InProgress",
    techStack: [
      { name: "React 19", purpose: "UI framework" },
      { name: "Vite 7", purpose: "Build tool" },
      { name: "React Router 7", purpose: "Client-side routing" },
      { name: "Framer Motion 12", purpose: "Animation library" },
      { name: "React Context", purpose: "State management" },
      { name: "Tailwind CSS 3", purpose: "Utility-first CSS" },
      { name: "shadcn/ui (Magic UI)", purpose: "Component primitives" },
      { name: "lucide-react", purpose: "Icons" },
      { name: "@emailjs/browser", purpose: "Newsletter email service" },
      { name: "Web3Forms", purpose: "Contact form submission" },
      { name: "react-hot-toast", purpose: "Toast notifications" },
      { name: "@headlessui/react", purpose: "Headless UI primitives" }
    ],
    architecture: "Pure client-side SPA with no backend. All state handled by React Context (EnergyContext). Pages include Home, About, Services, Contact, plus 4 'Coming Soon' placeholders (Blog, API, Whitepaper, Login). Deployed as static site on Vercel with SPA rewrite rules. External services (EmailJS, Web3Forms) handle form submissions directly from the browser.",
    designDecisions: [
      {
        decision: "React Context over Zustand/Redux for state management",
        rationale: "Minimal state needed — only wallet connection status and dark mode toggle. Context was sufficient for this simple use case.",
        tradeoffs: "Context causes re-renders of all consumers on any state change. Would not scale to real-time energy data or complex user interactions. No middleware for side effects."
      },
      {
        decision: "Mock Web3 wallet connection instead of real blockchain integration",
        rationale: "Validates UI/UX before investing in smart contract development. Allows investor demos and user feedback collection without blockchain complexity.",
        tradeoffs: "Creates expectation gap — marketing says 'Web3 protocol' but code has no blockchain interaction. Wallet address is hardcoded as '0x71C...4F2'. No ethers.js, wagmi, or viem dependency."
      },
      {
        decision: "No backend — third-party services for forms",
        rationale: "Fast deployment as pure static site on Vercel. Zero server management, zero DB operations.",
        tradeoffs: "Can't handle user authentication, real device data, energy grid monitoring, or personalized features. All state resets on page refresh."
      }
    ],
    challenges: [
      {
        problem: "Web3 integration is entirely simulated — no actual smart contract or blockchain interaction",
        solution: "Built UI placeholders with mock wallet connection. Hardcoded wallet address for visual demos. Planned future integration with wagmi/viem.",
        impact: "Works for portfolio demonstrations but cannot handle real blockchain transactions or energy grid data."
      },
      {
        problem: "React Context has undefined property (anomalyAlert) destructured in HomePage but never defined in context provider",
        solution: "Dead code — the alert section never renders. Appears to be a planned feature that wasn't implemented.",
        impact: "Minor — no crash occurs since undefined doesn't throw, but indicates incomplete feature work."
      },
      {
        problem: "Code duplication — FAQItem component duplicated verbatim in HomePage and AboutPage",
        solution: "Not extracted to shared components directory. Each page has its own copy of the same ~50-line component.",
        impact: "Updating FAQ behavior requires editing two files. Increases maintenance burden."
      }
    ],
    codeQuality: {
      hasTests: false,
      hasDocs: false,
      notableGaps: [
        "Zero test coverage",
        "Dead code (unused Hero component, undefined context property)",
        "Code duplication (FAQItem copied in two pages)",
        "Bug: window.KeyboardEvent always truthy in ternary operator",
        "No error boundaries",
        "No loading states for async operations"
      ]
    },
    frontendDetails: {
      stateManagement: "React Context (EnergyContext) with two valid fields: isWalletConnected (boolean) and isDarkMode (boolean). Custom hook useEnergy() for consumption. No reducer, no middleware.",
      componentArchitecture: "Page-based structure. Navigation and Footer imported individually in each page (no persistent layout wrapper). One reusable UI component (NumberTicker). Local duplicate components (FAQItem) instead of shared module.",
      renderingStrategy: "Client-side SPA with React Router. All pages are lazy-loaded via route definitions. Framer Motion whileInView for scroll-triggered animations. Heavy use of staggered entrance animations.",
      stylingApproach: "Tailwind CSS with shadcn/ui theming (CSS custom properties for colors). Dark mode via class strategy on <html>. Brand color (#135bec) hardcoded extensively. Glassmorphism effects with backdrop-filter: blur().",
      accessibilityNotes: "Limited. Mobile menu has keyboard navigation. Some buttons lack aria-labels. Coming Soon pages use disabled inputs without aria-disabled. CSS-only tooltips not keyboard accessible."
    },
    backendDetails: {
      apiDesign: "No custom backend. Two external services: EmailJS (newsletter signup from Footer) and Web3Forms (contact form submissions). Both called directly from browser with API keys exposed via VITE_ environment variables.",
      databaseSchema: "No database. All content (services, partners, team, testimonials, stats) is hardcoded in JSX. No persistence layer.",
      authStrategy: "No authentication system. LoginPage is a 'Coming Soon' placeholder with disabled form fields.",
      securityConsiderations: [
        "Third-party API keys in client-side environment variables (acceptable for EmailJS/Web3Forms as they use domain whitelisting)",
        "No backend means no server-side validation of form submissions",
        "No HTTPS enforcement config (handled by Vercel at platform level)"
      ],
      errorHandling: "Minimal. Web3Forms response checked for success/error and displayed inline. EmailJS uses react-hot-toast for success/error feedback. No global error boundary."
    },
    devopsDetails: {
      deployment: "Static SPA on Vercel with vercel.json SPA rewrites (all paths → /index.html).",
      ciCd: "Vercel auto-deploys from GitHub on push to main branch. No additional CI pipeline.",
      environmentConfig: "VITE_EMAIL_JS_SERVICE_ID, VITE_EMAIL_TEMPLATE_ID, VITE_EMAIL_JS_PUBLIC_KEY, VITE_GREATWALL_HUB_CONTACT_FORM in .env (gitignored)."
    },
    whatILearned: [
      "The gap between Web3 marketing and actual blockchain implementation requires honest communication",
      "React Context is insufficient for any app beyond trivial state — would use Zustand next time",
      "Code duplication grows exponentially without early refactoring — extract shared components early",
      "Third-party form services are great for prototyping but limit functionality",
      "Placeholder pages for 'Coming Soon' features set user expectations that must be fulfilled"
    ],
    interviewFocusAreas: {
      frontend: [
        "React Context limitations vs dedicated state libraries",
        "Code duplication patterns and refactoring strategies",
        "Dead code detection and prevention",
        "Framer Motion performance considerations",
        "CSS custom properties vs hardcoded values for theming",
        "Static site architecture decisions"
      ],
      backend: [
        "Client-side vs server-side form handling",
        "Third-party service integration patterns",
        "API key security in client-side applications",
        "When to add a backend vs stay serverless"
      ],
      fullstack: [
        "Prototyping with mock data vs building real integrations",
        "Managing expectations between marketing and technical reality",
        "Choosing between serverless, backend, and third-party services",
        "SPA architecture — when it works and when it doesn't"
      ],
      software: [
        "MVP scoping — what to build vs what to simulate",
        "Technical debt from prototyping shortcuts",
        "Documentation for known limitations",
        "Prioritization when building solo"
      ]
    },
    repoUrl: "https://github.com/JAM3S11/greatwall",
    liveUrl: "https://greatwallhub.vercel.app/"
  },
  {
    name: "Franatech Website",
    description: "A professional corporate landing page designed for technical services, focusing on conversion-driven UI and seamless responsive performance. Based on the HTML Codex template with customization.",
    category: "frontend",
    status: "Completed",
    techStack: [
      { name: "HTML5", purpose: "Semantic markup across 11 pages" },
      { name: "CSS3 + CSS Custom Properties", purpose: "Styling with :root theming" },
      { name: "Bootstrap 5.0.0", purpose: "Responsive layout and components" },
      { name: "jQuery 3.4.1", purpose: "DOM manipulation and event handling" },
      { name: "Owl Carousel 2.3.4", purpose: "Touch-enabled carousels" },
      { name: "WOW.js", purpose: "Scroll-triggered animations" },
      { name: "CounterUp", purpose: "Animated counting effects" },
      { name: "Font Awesome 5", purpose: "Icons" },
      { name: "Google Fonts (Nunito + Rubik)", purpose: "Typography" }
    ],
    architecture: "Classic multi-page static website (MPA). 11 standalone HTML files with no client-side routing. Each page is self-contained with duplicated <head>, navbar, footer, and scripts sections. No build tools, no package.json, no templating system. All libraries vendored locally in lib/ directory or loaded from CDN.",
    designDecisions: [
      {
        decision: "Static multi-page HTML over SPA framework",
        rationale: "Simplest deployment (no server needed), works without JavaScript enabled, maximum browser compatibility.",
        tradeoffs: "Massive duplication across 11 pages — every nav change requires editing all files. No component reuse, no partials system."
      },
      {
        decision: "jQuery dependency over vanilla JS",
        rationale: "Bootstrap 5 still supported jQuery at creation time, and many template plugins (Owl Carousel, CounterUp) required jQuery.",
        tradeoffs: "Adds ~87KB to page load. Modern vanilla JS can achieve same results with less overhead. Creates jQuery lock-in for all interactivity."
      },
      {
        decision: "CSS Custom Properties for theming vs CSS preprocessor",
        rationale: "Simpler setup — no Sass/PostCSS compilation needed. :root variables easily changed.",
        tradeoffs: "No mixins, no nesting, no built-in functions. CSS file is flatter and more repetitive than a preprocessor version would be."
      }
    ],
    challenges: [
      {
        problem: "Identical HTML (head, navbar, footer, scripts) copy-pasted across all 11 pages",
        solution: "No templating solution applied. Each page is a standalone file with full duplication.",
        impact: "Any structural change (new nav link, footer update, script addition) requires editing every HTML file manually."
      },
      {
        problem: "Forms have no action attributes or submission handling",
        solution: "Forms are visual-only placeholders. No JavaScript intercepts submission. No validation logic.",
        impact: "Cannot collect user input without adding backend integration (Formspree, etc.) or JavaScript handlers."
      },
      {
        problem: "CDN dependency for critical libraries (jQuery, Bootstrap JS)",
        solution: "No fallback loading. If CDN is unavailable, the entire site's interactivity breaks. Local lib/ folder only has less critical libraries.",
        impact: "Single point of failure for core functionality. No offline capability."
      }
    ],
    codeQuality: {
      hasTests: false,
      hasDocs: false,
      notableGaps: [
        "No package.json or dependency management",
        "No build tooling (Webpack, Vite, Gulp)",
        "Inline style attributes mixed with CSS file",
        "Broken links (malito: typo, href='#' placeholders)",
        "No .gitignore for the repository",
        "Unused library variants (Owl Carousel green theme)",
        "Spinner timing is effectively immediate (1ms timeout)"
      ]
    },
    frontendDetails: {
      stateManagement: "None — fully static HTML pages. No JavaScript state management needed.",
      componentArchitecture: "No component system. Each page is a standalone HTML document. Shared elements (navbar, footer) duplicated across files. CSS organized in comment-delimited sections (Spinner, Navbar, Carousel, etc.).",
      renderingStrategy: "Server-rendered HTML (static files). No client-side rendering. Page transitions are full browser navigations.",
      stylingApproach: "Bootstrap 5 grid + utility classes combined with custom CSS (~450 lines). CSS custom properties for theming (--primary: #06a3da, --secondary: #34ad54). Owl Carousel for carousels. WOW.js + animate.css for scroll animations.",
      accessibilityNotes: "Some aria-labels present. Semantic HTML used. Keyboard navigation via Bootstrap defaults. Color contrast not systematically verified."
    },
    backendDetails: {
      apiDesign: "No backend. Purely static files served by any web server (Apache, Nginx, Vercel).",
      databaseSchema: "No database. All content hardcoded in HTML.",
      authStrategy: "No authentication system.",
      securityConsiderations: [
        "No server-side processing means no server-side vulnerabilities",
        "Forms are visual-only — no data collection endpoint",
        "No HTTPS enforcement (depends on hosting platform)"
      ],
      errorHandling: "No error handling — no dynamic operations to fail."
    },
    devopsDetails: {
      deployment: "Deployed on Vercel as static site. Can also be served by any web server (Apache, Nginx) without configuration.",
      ciCd: "Vercel auto-deploys from GitHub.",
      environmentConfig: "No environment variables needed — no backend or API integrations."
    },
    whatILearned: [
      "Multi-page HTML templates are simple to deploy but expensive to maintain at scale",
      "CDN dependencies create single points of failure — bundle critical libraries locally",
      "CSS custom properties enable easy theming without preprocessors",
      "Forms without handlers are misleading to users — always provide feedback or redirect",
      "Template inheritance (even simple PHP includes) saves enormous maintenance effort"
    ],
    interviewFocusAreas: {
      frontend: [
        "MPA vs SPA architecture decisions and trade-offs",
        "CSS custom properties for theming vs preprocessors",
        "jQuery dependency cost-benefit analysis for modern web",
        "HTML duplication and templating strategies",
        "CDN dependency risks and fallback strategies",
        "Progressive enhancement approach for interactivity",
        "Form handling without backend infrastructure"
      ],
      backend: [],
      fullstack: [
        "Static site generation vs server-rendered vs SPA",
        "Build tooling decisions for different project scales",
        "Form data collection strategies without a backend"
      ],
      software: [
        "Technical debt from copy-paste patterns",
        "Licensing considerations (CC BY 4.0 requires attribution)",
        "When to use a template vs build from scratch",
        "Maintenance cost estimation for static sites at scale"
      ]
    },
    repoUrl: "https://github.com/JAM3S11/franatech-website-template",
    liveUrl: "https://franatech-website-template.vercel.app/"
  },
  {
    name: "Open Weather Demo",
    description: "A real-time weather tracking application utilizing RESTful APIs to deliver accurate meteorological data with a focus on clean data visualization and responsive design.",
    category: "frontend",
    status: "Completed",
    techStack: [
      { name: "React", purpose: "UI framework" },
      { name: "Tailwind CSS", purpose: "Utility-first styling" },
      { name: "Headless UI", purpose: "Accessible UI primitives" },
      { name: "Lucide React", purpose: "Icons" },
      { name: "Axios", purpose: "HTTP client for API requests" }
    ],
    architecture: "Single-page React application that fetches weather data from a public REST API (OpenWeatherMap). Clean separation between API service layer, component presentation, and state management. Responsive design with mobile-first approach.",
    designDecisions: [
      {
        decision: "Axios over fetch API",
        rationale: "Axios provides automatic JSON parsing, request/response interceptors, cleaner error handling with status codes, and timeout configuration out of the box.",
        tradeoffs: "Adds ~14KB bundle size. Modern fetch with wrappers can achieve similar functionality without external dependency."
      },
      {
        decision: "Headless UI for form components",
        rationale: "Provides fully accessible, unstyled primitives that integrate naturally with Tailwind's utility classes. Better than building from scratch.",
        tradeoffs: "Additional dependency, limited component set compared to full UI libraries."
      }
    ],
    challenges: [
      {
        problem: "API rate limiting and error states need graceful handling",
        solution: "Uses conditional rendering for loading, error, and empty states. Axios interceptors handle common errors globally.",
        impact: "Provides clean user feedback during API failures or limits."
      }
    ],
    codeQuality: {
      hasTests: false,
      hasDocs: false,
      notableGaps: [
        "No error boundaries for runtime errors",
        "No API response caching strategy",
        "Limited offline support"
      ]
    },
    frontendDetails: {
      stateManagement: "React useState/useEffect for component-local state. No global state library needed for this scale.",
      componentArchitecture: "Simple component tree: App → SearchBar, WeatherDisplay, ForecastPanel. Each component handles its own data fetching or receives data via props.",
      renderingStrategy: "Client-side rendering with React. Conditional rendering for loading/error/data states. Responsive grid layout for weather cards.",
      stylingApproach: "Tailwind CSS utility classes throughout. Headless UI components styled with Tailwind variants. Responsive breakpoints for mobile/tablet/desktop.",
      accessibilityNotes: "Headless UI provides baked-in accessibility (keyboard navigation, screen reader support). Semantic HTML structure. Loading states announced to screen readers."
    },
    backendDetails: {
      apiDesign: "Consumes OpenWeatherMap REST API. Axios instance configured with base URL, API key parameter, and timeout. Error handling via Axios interceptors.",
      databaseSchema: "No database. All weather data fetched live from API.",
      authStrategy: "API key authentication via query parameter (API key in environment variable).",
      securityConsiderations: [
        "API key exposed in client-side bundle (VITE_ prefixed env var)",
        "No rate limiting on client side — relies on API provider limits",
        "No user data collected or stored"
      ],
      errorHandling: "Axios interceptor for 401 (unauthorized), 404 (not found), 429 (rate limited). User-facing error messages for each case. Graceful fallback UI when API is unavailable."
    },
    devopsDetails: {
      deployment: "Vercel with SPA rewrite rules. Auto-deploy from GitHub.",
      ciCd: "Vercel auto-deployment from repository.",
      environmentConfig: "VITE_OPENWEATHER_API_KEY for API authentication."
    },
    whatILearned: [
      "Axios interceptors provide clean centralized error handling for API calls",
      "Headless UI + Tailwind is a powerful combination for accessible, custom-styled components",
      "API key management in client-side apps requires careful consideration",
      "Clean data visualization matters more than complex animations for utility apps"
    ],
    interviewFocusAreas: {
      frontend: [
        "Axios vs fetch API — decision factors and trade-offs",
        "API error handling patterns in React",
        "Loading/error/empty state management",
        "Conditional rendering strategies",
        "Responsive data visualization patterns",
        "Component decomposition for simple vs complex UIs"
      ],
      backend: [
        "REST client architecture and API integration patterns",
        "API key security considerations in client-side apps",
        "Rate limiting strategies for third-party API consumption"
      ],
      fullstack: [
        "Third-party API integration patterns",
        "Environment variable management across environments"
      ],
      software: [
        "Single-responsibility principle in small applications",
        "External dependency cost-benefit analysis",
        "Error handling as a first-class UX concern"
      ]
    },
    repoUrl: "https://openweatherapidemo.vercel.app/",
    liveUrl: "https://openweatherapidemo.vercel.app/"
  },
  {
    name: "eticketing",
    description: "A server-side IT support management system built with PHP and MySQL, streamlining ticket lifecycle management and inter-departmental collaboration. Single-file role dashboards with hash-based navigation.",
    category: "backend",
    status: "Completed",
    techStack: [
      { name: "PHP", purpose: "Server-side scripting and business logic" },
      { name: "MySQL", purpose: "Relational database" },
      { name: "Bootstrap 3.3.7", purpose: "CSS framework and responsive layout" },
      { name: "jQuery 3.7.0", purpose: "DOM manipulation and AJAX" },
      { name: "AJAX", purpose: "Async form submissions" },
      { name: "jQuery Tabledit", purpose: "Inline table editing" },
      { name: "Apache (XAMPP)", purpose: "Local development server" },
      { name: "Unicons", purpose: "Icons" }
    ],
    architecture: "Procedural PHP monolith with no MVC framework. Each role has a single index.php file handling all views via hash-based tab switching (#D0, #D1, #D2). Authentication via 5 cookies (username, useremail, usertype, status, uid) with 2-day expiry. Shared header.php and footer.php included by all role pages. AJAX endpoints in commons/inc/ handle state changes.",
    designDecisions: [
      {
        decision: "Cookie-based authentication over PHP sessions",
        rationale: "Simpler implementation — no session configuration needed, works across page refreshes without server-side session storage.",
        tradeoffs: "Extremely insecure — usertype cookie is never re-verified against database. Plaintext passwords in varchar(13) column. No CSRF protection. Cookies set without HttpOnly or Secure flags."
      },
      {
        decision: "Procedural PHP over MVC framework (Laravel, Symfony)",
        rationale: "Zero framework overhead, minimal learning curve, fastest time to working prototype.",
        tradeoffs: "No separation of concerns. Business logic, SQL queries, and HTML presentation interleaved in single files. No routing, no ORM, no middleware."
      },
      {
        decision: "Hash-based tab navigation over server-side routing",
        rationale: "Single-file dashboards are simpler to deploy and maintain than multi-page interfaces.",
        tradeoffs: "No clean URLs, no deep-linking to specific tabs, no server-side route handling. Makes the app feel less like a modern SPA."
      },
      {
        decision: "No database foreign key constraints",
        rationale: "Application-layer relationship management reduces schema complexity.",
        tradeoffs: "No referential integrity enforcement. Orphaned records possible. No cascade operations."
      }
    ],
    challenges: [
      {
        problem: "Critical security vulnerabilities — plaintext passwords, client-trusted role cookies, SQL injection potential",
        solution: "None implemented. The uncrack() function does weak sanitization (htmlspecialchars, stripcslashes, quote-escaping) but no parameterized queries.",
        impact: "Production deployment would be highly vulnerable to attack. Suitable only for local/internal networks with trusted users."
      },
      {
        problem: "Two connection.php files with duplicated configuration",
        solution: "One in membership/ for auth operations, one in commons/inc/ for AJAX endpoints. They are nearly identical.",
        impact: "Configuration changes must be made in two places — risk of drift and hard-to-find bugs."
      },
      {
        problem: "Missing dataEdit.php — referenced in JavaScript but not present in repository",
        solution: "The 'Edit Users' tab in the admin panel calls ../commons/inc/dataEdit.php which does not exist.",
        impact: "Admin user editing is non-functional. Likely a planned feature that was never implemented."
      },
      {
        problem: "Zombie 'Respondent' role checked in is_respondent() but not in usertypes table",
        solution: "Zombie code — the function checks for a role that doesn't exist in the database.",
        impact: "Won't cause errors (returns false for all users) but indicates incomplete role cleanup."
      }
    ],
    codeQuality: {
      hasTests: false,
      hasDocs: false,
      notableGaps: [
        "Plaintext password storage (varchar(13), no hashing)",
        "No parameterized queries — direct string interpolation in SQL",
        "Client-trusted role authorization via cookie",
        "No CSRF protection",
        "Error reporting enabled in production (ini_set('display_errors', 1))",
        "Missing file (dataEdit.php) breaks admin user editing",
        "Typo in footer.php script path (commoss vs commons)"
      ]
    },
    frontendDetails: {
      stateManagement: "No frontend state management. Page state managed via URL hash fragments (#D0-D3) and CSS :target pseudo-class. Form data submitted via AJAX with full page reload on success.",
      componentArchitecture: "No component system. Each role is a single PHP file with all views mixed together. Shared elements (sidebar, footer) via PHP includes.",
      renderingStrategy: "Server-rendered PHP pages. AJAX for state changes, followed by window.location.reload(). Dark mode persisted via localStorage.",
      stylingApproach: "Bootstrap 3.3.7 with custom CSS (~450 lines). Dark mode via CSS class toggle on body. Unicons for icons. Inline styles in login/registration pages.",
      accessibilityNotes: "Minimal. Bootstrap 3 provides basic keyboard navigation. Custom components lack aria attributes. Tab key navigation not tested."
    },
    backendDetails: {
      apiDesign: "No REST API. Form posts and AJAX requests to PHP files that return empty 200 OK on success. All data exchange via application/x-www-form-urlencoded. No JSON endpoints.",
      databaseSchema: "3 tables: users (7 fields, varchar(13) password, soft-delete via Status), complaints/tickets (12 fields, priority 0-10, status 0-2), usertypes (enumeration). No foreign key constraints. Unused Complainant_endtime column always zeros.",
      authStrategy: "5 cookies (username, useremail, usertype, status, uid) set on login with 2-day expiry. No PHP sessions. Role is read from cookie on each request with no server-side verification. Registration requires admin approval.",
      securityConsiderations: [
        "CRITICAL: Plaintext passwords stored in varchar(13)",
        "CRITICAL: Role authorization from client-controlled cookie",
        "CRITICAL: SQL injection via string interpolation",
        "HIGH: No CSRF protection",
        "HIGH: Error details displayed to users",
        "MEDIUM: No HTTPS enforcement",
        "MEDIUM: Cookies without HttpOnly or Secure flags"
      ],
      errorHandling: "Errors displayed inline via PHP echo. AJAX failures shown via browser alert(). No logging, no structured error responses."
    },
    devopsDetails: {
      deployment: "XAMPP stack (Apache, MySQL, PHP) for local development. No production deployment configuration.",
      ciCd: "No CI/CD. Manual deployment via file transfer.",
      environmentConfig: "Database credentials hardcoded in connection.php files. No .env or config separation."
    },
    whatILearned: [
      "Security cannot be an afterthought — plaintext passwords and cookie-based roles are unacceptable for any production system",
      "Duplicated configuration files are a maintenance liability — always use a single source of truth",
      "Procedural PHP scales poorly beyond a few pages — MVC frameworks exist for good reason",
      "Foreign key constraints are essential for data integrity in relational databases",
      "AJAX with full page reload defeats the purpose of async requests",
      "All planned features should either be implemented or removed — missing files break functionality silently"
    ],
    interviewFocusAreas: {
      frontend: [],
      backend: [
        "Authentication and authorization security best practices",
        "SQL injection prevention (prepared statements vs string interpolation)",
        "Password storage — hashing algorithms (bcrypt, argon2) vs plaintext",
        "Session management — PHP sessions vs cookie-based approaches",
        "CSRF protection strategies",
        "Database schema design — foreign keys, constraints, normalization",
        "Error handling — why display_errors should never be enabled in production",
        "API design principles — REST vs form-based data exchange"
      ],
      fullstack: [
        "Procedural vs MVC architecture trade-offs",
        "Role-based access control implementation patterns",
        "File organization and configuration management",
        "Soft-delete patterns for user data"
      ],
      software: [
        "Security-first development mindset",
        "Technical debt from rapid prototyping",
        "Comprehensive testing for security-critical applications",
        "Code review priorities for legacy codebases",
        "Feature completeness vs production readiness",
        "Documentation expectations for internal tools"
      ]
    },
    repoUrl: "https://github.com/JAM3S11/eticketing",
    liveUrl: "#"
  },
  {
    name: "HOSPITABILITY",
    description: "Sparkles Kenya hospitality supply website — a premium provider of hospitality supplies, delivering excellence from industrial detergents to luxury amenities across Kenya.",
    category: "frontend",
    status: "Demo Illustration",
    techStack: [
      { name: "React 19", purpose: "UI framework" },
      { name: "TypeScript 5 (strict)", purpose: "Type-safe development" },
      { name: "Vite 7", purpose: "Build tool" },
      { name: "Tailwind CSS 4", purpose: "Utility-first CSS (with @theme directive)" },
      { name: "React Router DOM 7", purpose: "Client-side routing" },
      { name: "Lucide React", purpose: "Icons" }
    ],
    architecture: "Static React SPA with TypeScript strict mode. All content (services, testimonials, team, stats) is hardcoded in TypeScript data files. No backend, no API calls, no database. Services rendered from static arrays with string-to-icon mapping. 4 pages: Home, Services, About, Contact.",
    designDecisions: [
      {
        decision: "TypeScript strict mode with noUnusedLocals and noUnusedParameters",
        rationale: "Catches unused variables at compile time, prevents dead code from shipping. Provides full IDE autocompletion and type checking.",
        tradeoffs: "Slower initial development, more verbose types for simple data structures. Requires type definitions for all props and state."
      },
      {
        decision: "Icon string indirection — icon name stored as string, resolved at render time",
        rationale: "Keeps data.ts clean and free of React imports. Service data can be JSON-serialized. Icon mapping centralized in ServiceCard component.",
        tradeoffs: "Adds a runtime lookup layer. String-to-component mapping must be maintained. TypeScript can't verify icon names at compile time."
      },
      {
        decision: "Tailwind CSS v4 with @theme directive",
        rationale: "Tailwind v4 eliminates PostCSS config complexity. @theme directive scopes custom design tokens declaratively within CSS.",
        tradeoffs: "Tailwind v4 is newer — fewer community resources, potential plugin compatibility issues. Different syntax than v3."
      },
      {
        decision: "No backend — fully static data",
        rationale: "Zero server costs, instant page loads, simple Vercel deployment. Perfect for a demo/marketing site.",
        tradeoffs: "Content changes require code edits and redeployment. No user accounts, no analytics beyond Vercel's built-in, no dynamic content."
      }
    ],
    challenges: [
      {
        problem: "Dead Hero component — defined but never imported in any page",
        solution: "Each page has its own inline hero section instead of composing the shared component.",
        impact: "Unused code that increases bundle size slightly and creates confusion about the intended component architecture."
      },
      {
        problem: "Contact form has no submission handler — only console.log",
        solution: "Form logs data to console on submission. No fetch/axios call to any endpoint.",
        impact: "Form appears functional but does nothing. Visitor messages are never captured."
      },
      {
        problem: "Duplicate CSS files — index.css (205 lines) and styles.css (18 lines)",
        solution: "index.css is imported in main.tsx. styles.css appears to be an early version that was never removed.",
        impact: "Minor confusion — a developer might edit the wrong file. No functional impact."
      }
    ],
    codeQuality: {
      hasTests: false,
      hasDocs: false,
      notableGaps: [
        "Dead Hero component never used",
        "Contact form has no backend",
        "Duplicate CSS files",
        "Social media links all point to #",
        "Placeholder team member icons (generic Users icon)",
        "Duplicate entry in capabilities section",
        "No React error boundaries",
        "No SEO meta tags"
      ]
    },
    frontendDetails: {
      stateManagement: "Pure React hooks (useState, useMemo, useCallback). No external state library. ServicesPage manages selectedCategory and searchTerm as local state.",
      componentArchitecture: "4 standalone pages that each import Navigation and Footer directly. ServiceCard and ServiceGrid reusable components. No persistent layout wrapper. Single `types/` file for all TypeScript interfaces.",
      renderingStrategy: "Client-side SPA with React Router. ScrollToTop component resets scroll on route change. CSS-based staggered animations via nth-child selectors.",
      stylingApproach: "Tailwind v4 @theme for design tokens. Custom keyframe animations (fadeInUp, fadeInLeft, slideInScale). Glassmorphism effects. Staggered animation utility classes. Responsive grid system.",
      accessibilityNotes: "Keyboard navigation for mobile menu. focus:ring on interactive elements. Semantic HTML structure. No systematic screen reader testing."
    },
    backendDetails: {
      apiDesign: "No backend. All data static from TypeScript files.",
      databaseSchema: "No database. Service and Category data from src/utils/data.ts as typed arrays.",
      authStrategy: "No authentication.",
      securityConsiderations: [
        "No server-side attack surface — purely static files",
        "Form submission not implemented — no data collection endpoint"
      ],
      errorHandling: "No async operations. React runtime errors not caught by error boundaries."
    },
    devopsDetails: {
      deployment: "Vercel static SPA with vercel.json rewrites.",
      ciCd: "Vercel auto-deploys from GitHub.",
      environmentConfig: "No environment variables needed."
    },
    whatILearned: [
      "TypeScript strict mode catches real bugs but requires disciplined type definitions",
      "Tailwind v4's @theme directive simplifies custom design tokens compared to v3 config",
      "Icon string-to-component mapping keeps data clean but adds runtime indirection",
      "Even demo sites need form handlers — console.log is not enough",
      "Dead components should be removed immediately to avoid confusion",
      "Static sites are fast and simple but content updates require code changes"
    ],
    interviewFocusAreas: {
      frontend: [
        "TypeScript strict mode configuration and benefits",
        "Tailwind CSS v3 vs v4 differences and migration paths",
        "Dead code detection and prevention strategies",
        "Static vs dynamic data architecture decisions",
        "Icon component patterns (string mapping, tree-shaking)",
        "CSS animation performance considerations",
        "Component decomposition patterns for marketing sites",
        "Form handling in static SPAs"
      ],
      backend: [
        "Third-party form service integration options",
        "Static site backend trade-offs"
      ],
      fullstack: [
        "Content management strategies for static sites (headless CMS vs hardcoded data)",
        "SPA architecture decisions for different project types",
        "Deployment strategies for client-side vs server-rendered apps"
      ],
      software: [
        "TypeScript adoption strategies for existing JS projects",
        "Code quality practices — removing dead code, eliminating duplicates",
        "Demo vs production readiness — what changes between them",
        "Documentation expectations for different project types (demo vs production)"
      ]
    },
    repoUrl: "https://github.com/JAM3S11/hospitality",
    liveUrl: "https://sparklesltd.vercel.app/"
  },
  {
    name: "WANTACH WORKFLOW ILLUSTRATION",
    description: "An n8n-style automation workflow diagram built with Next.js 14, TypeScript, and Tailwind CSS. Visualizes the end-to-end registration process for RegEase Kenya, including client intake, document validation, government portal integration and payment automation.",
    category: "frontend",
    status: "Completed",
    techStack: [
      { name: "Next.js 14", purpose: "React framework with App Router" },
      { name: "TypeScript", purpose: "Type safety" },
      { name: "Tailwind CSS 3.4", purpose: "Utility-first CSS" },
      { name: "React", purpose: "UI component library" },
      { name: "Google Fonts (JetBrains Mono + Syne)", purpose: "Typography" },
      { name: "lucide-react", purpose: "Icons (likely)" },
      { name: "Vercel", purpose: "Deployment platform" }
    ],
    architecture: "Single-page Next.js 14 application using App Router. Entire workflow is a static, pre-computed swimlane diagram — not an interactive drag-and-drop builder. All workflow data is hardcoded in a TypeScript data structure. Tab filtering via single useState hook. Components: WorkflowCanvas, NodeCard, ArrowConnector, Lane, SectionHeader, Legend, StatsBar, TabBar.",
    designDecisions: [
      {
        decision: "Static swimlane diagram over interactive n8n-style builder",
        rationale: "Scoped to illustration/documentation only. Interactive drag-and-drop would require canvas/SVG library, complex state management, and execution engine — overkill for a portfolio piece.",
        tradeoffs: "Cannot create, delete, rearrange, or edit nodes. No workflow execution. CSS-only arrows limit to straight horizontal lines — no curved paths or branching."
      },
      {
        decision: "CSS-only arrows (border triangles) instead of SVG or Canvas",
        rationale: "Zero bundle overhead, simple to implement, perfectly adequate for straight horizontal connectors between nodes.",
        tradeoffs: "Only straight lines possible. No curved paths, no branching forks, no animated flows. Cannot easily add arrow labels that follow curved paths."
      },
      {
        decision: "Emoji-first iconography over icon library",
        rationale: "No icon library dependency. Emojis are universally supported, lightweight, and expressive enough for workflow visualization.",
        tradeoffs: "Inconsistent rendering across platforms. No accessibility for screen readers without aria-labels. Limited visual customization."
      },
      {
        decision: "Single-page single-route with tab filtering",
        rationale: "Simplest possible state management (one useState). No routing complexity. All workflow views accessible from one URL.",
        tradeoffs: "No deep-linking to specific tabs. Browser back/forward doesn't switch tabs. No SEO for individual workflow views."
      }
    ],
    challenges: [
      {
        problem: "No keyboard accessibility — emoji-only icons, CSS-only tooltips, no focus management",
        solution: "Not addressed. The diagram is primarily visual with hover-based interactions.",
        impact: "Screen reader users cannot access workflow information. Keyboard-only users cannot interact with nodes."
      },
      {
        problem: "CSS-only arrows cannot render curved paths or visual branches",
        solution: "Conditional branching is indicated via YES/NO labels on straight arrows rather than visual forking.",
        impact: "The diagram implies linear flow even where conditional branches exist. Branching logic is documented in tooltips rather than visually."
      },
      {
        problem: "Hardcoded workflow data requires code changes for any update",
        solution: "All node definitions, sections, lanes, and stats are embedded in the page component.",
        impact: "Adding a node or changing a workflow step requires editing source code, rebuilding, and redeploying."
      }
    ],
    codeQuality: {
      hasTests: false,
      hasDocs: false,
      notableGaps: [
        "No keyboard accessibility",
        "Emoji-only icons without aria-labels",
        "CSS-only tooltips not keyboard accessible",
        "No focus management for tab switching",
        "No deep-linking to specific workflow tabs",
        "All data hardcoded — no dynamic content possible"
      ]
    },
    frontendDetails: {
      stateManagement: "Single useState<string> hook for active tab selection ('main' | 'docs' | 'notify' | 'payment'). No other state. All workflow data hardcoded.",
      componentArchitecture: "Shallow component tree: Page → TabBar, Legend, WorkflowCanvas → Section → Lane → NodeCard + ArrowConnector. StatsBar below canvas. Each component is focused and single-purpose.",
      renderingStrategy: "Next.js client component. CSS overflow-x-auto for horizontal scroll within sections. Sticky lane labels maintain visibility during scroll. NodeCard tooltips via CSS group-hover.",
      stylingApproach: "Tailwind CSS with GitHub Dark theme colors (#0d1117, #161b22 backgrounds). Color-coded node types (trigger=orange, action=blue, condition=gold, integration=green, output=purple, error=red). CSS grid background overlay pattern.",
      accessibilityNotes: "No accessibility implementation. Emoji icons without alt text. CSS-only tooltips not keyboard accessible. No ARIA landmarks or roles."
    },
    backendDetails: {
      apiDesign: "No backend. Static Next.js site deployed on Vercel.",
      databaseSchema: "No database. Workflow data is a TypeScript object in the page component.",
      authStrategy: "No authentication.",
      securityConsiderations: [
        "No server-side processing — static export only",
        "No user data collected"
      ],
      errorHandling: "No runtime errors possible — no API calls, no async operations."
    },
    devopsDetails: {
      deployment: "Vercel with Next.js build. Static site export.",
      ciCd: "Vercel auto-deploys from GitHub.",
      environmentConfig: "No environment variables needed."
    },
    whatILearned: [
      "CSS-only diagrams are efficient for static illustrations but limited for interactive use cases",
      "Single useState is sufficient for tab-based filtering without a state library",
      "Emoji icons keep bundles small but compromise accessibility",
      "Hardcoded workflow data is great for demos but doesn't scale to dynamic content",
      "Scope management — choosing 'static diagram' over 'interactive builder' was the right call for a portfolio piece",
      "Accessibility should be considered from the start — retrofitting is harder than building it in"
    ],
    interviewFocusAreas: {
      frontend: [
        "CSS-only UI patterns — arrows, tooltips, grid backgrounds",
        "Component decomposition for complex visual layouts",
        "Next.js App Router vs Pages Router trade-offs",
        "Tab-based navigation UX patterns",
        "Emoji vs SVG vs icon font decision factors",
        "CSS positioning techniques for swimlane layouts",
        "Scoping decisions — static diagram vs interactive builder"
      ],
      backend: [],
      fullstack: [
        "Static site generation vs server-side rendering for different use cases",
        "Next.js client vs server component decisions",
        "Single-page vs multi-page architecture for documentation tools"
      ],
      software: [
        "MVP scoping — how to decide what NOT to build",
        "Accessibility as a first-class requirement vs afterthought",
        "Data architecture — hardcoded vs API-driven decisions",
        "Technical documentation through visual diagrams",
        "Trade-off documentation — knowing and communicating limitations"
      ]
    },
    repoUrl: "https://github.com/JAM3S11/regease-workflow",
    liveUrl: "https://wantach-workflow.vercel.app/"
  }
];

export function getProjectByName(name: string): ProjectTechnicalDetail | undefined {
  return PROJECTS.find(
    p => p.name.toLowerCase() === name.toLowerCase()
  );
}

export function getProjectsByCategory(category: string): ProjectTechnicalDetail[] {
  if (category === 'all') return PROJECTS;
  return PROJECTS.filter(p => p.category === category);
}

export function getRandomProject(): ProjectTechnicalDetail {
  const index = Math.floor(Math.random() * PROJECTS.length);
  return PROJECTS[index];
}

export function getProjectNames(): string[] {
  return PROJECTS.map(p => p.name);
}

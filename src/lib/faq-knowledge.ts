import { generateGeminiResponse, improveFAQResponse, generateDeepDiveResponse as generateDeepDiveGemini, isGeminiConfigured, generateGeminiResponseWithMetrics, generateDeepDiveResponseWithMetrics as generateDeepDiveWithMetrics, type MetricResult } from "./gemini-service";
import { PROJECTS } from "./project-knowledge";

export interface FAQ {
  keywords: string[];
  getResponse: (matchedKeyword?: string, context?: FAQContext) => string;
}

export interface FAQContext {
  name?: string;
  email?: string;
  currentProject?: string;
}

const portfolioInfo = {
  name: "James Daniel",
  role: "Full-Stack Developer",
  location: "Kenya",
  email: "jdndirangu2020@gmail.com",
  phone: "+254 716 041419",
  github: "https://github.com/JAM3S11",
  linkedin: "https://linkedin.com/in/jamesdaniel",
  skills: [
    "React.js", "Next.js", "TypeScript", "JavaScript",
    "Tailwind CSS", "Node.js", "Express.js", "MongoDB",
    "PostgreSQL", "Supabase", "Python", "Docker"
  ],
  projects: [
    { name: "SOLEASE", desc: "ITSM Platform" },
    { name: "Greatwall", desc: "Web3 Energy Protocol" },
    { name: "Franatech", desc: "Corporate Website" },
    { name: "Open Weather Demo", desc: "Weather Tracking App" },
    { name: "eticketing", desc: "PHP Ticketing System" },
    { name: "HOSPITABILITY", desc: "Hospitality Supply Website" },
    { name: "WANTACH WORKFLOW", desc: "Workflow Diagram" }
  ],
  experience: "4+ years",
  availability: "open to opportunities",
  hourlyRate: "$30-50",
  responseTime: "within 24 hours"
};

export const faqKnowledgeBase: FAQ[] = [
  // ABOUT ME
  {
    keywords: ['who', 'about', 'introduce', 'tell me about', 'yourself', 'profile'],
    getResponse: () => `Hi! I'm ${portfolioInfo.name}, a ${portfolioInfo.role} with ${portfolioInfo.experience} of experience building high-performance web applications. I specialize in React, Next.js, Node.js, and modern web technologies.`
  },
  
  // WHO IS JAMES
  {
    keywords: ['who is james', 'who is james daniel', 'tell me about james'],
    getResponse: () => `${portfolioInfo.name} is a skilled Full-Stack Developer based in ${portfolioInfo.location} with ${portfolioInfo.experience} of hands-on experience. He's built various projects ranging from ITSM platforms to Web3 applications. James is passionate about clean code, user experience, and continuous learning.`
  },

  // WHAT DOES JAMES DO
  {
    keywords: ['what do you do', 'what is james do', 'what kind of work'],
    getResponse: () => `James builds modern web applications using React, Next.js, and Node.js. He creates responsive websites, full-stack web apps, REST APIs, real-time applications, and has experience with Web3/blockchain technologies. He's open to freelance projects and full-time opportunities!`
  },

  // HOW LONG EXPERIENCE
  {
    keywords: ['how long have you been', 'how experienced', 'senior', 'junior'],
    getResponse: () => `James has ${portfolioInfo.experience} of experience in web development. This includes building production-ready applications, working with clients, and contributing to various projects. He operates at a senior level for most stack-related tasks.`
  },

  // SKILLS & TECH STACK
  {
    keywords: ['skills', 'tech', 'stack', 'technologies', 'tools', 'what do you use', 'expertise', 'expert'],
    getResponse: () => `My main technologies include: ${portfolioInfo.skills.join(', ')}. I focus on building clean, maintainable code and user-friendly applications. Would you like to see my projects?`
  },
  
  // REACT
  {
    keywords: ['react', 'reactjs'],
    getResponse: () => `I have extensive experience with React.js, including React 19, Next.js, and related technologies like Tailwind CSS, Framer Motion, and Zustand for state management. Check out my About page for more details!`
  },

  // NEXT.JS  
  {
    keywords: ['nextjs', 'next.js', 'nextjs14', 'next15'],
    getResponse: () => `I use Next.js for server-side rendering and API routes. I've built several projects with it including my portfolio and various client websites. Next.js pairs perfectly with Supabase for full-stack applications!`
  },

  // TAILWIND
  {
    keywords: ['tailwind', 'tailwindcss', 'css', 'styling'],
    getResponse: () => `I use Tailwind CSS for styling - it's efficient and makes building responsive designs a breeze. Combined with custom CSS for animations, I create beautiful, modern interfaces.`
  },

  // MONGODB
  {
    keywords: ['mongodb', 'mongo', 'database', 'nosql'],
    getResponse: () => `MongoDB is my go-to for NoSQL databases. I use it with Node.js/Express for flexible data modeling, particularly in ITSM and real-time applications.`
  },

  // SUPABASE
  {
    keywords: ['supabase', 'postgres', 'postgresql', 'firebase alternative'],
    getResponse: () => `Supabase is awesome! It's an open-source Firebase alternative built on PostgreSQL. I use it for authentication, real-time subscriptions, and as a backend for various projects including this chat widget!`
  },

  // NODE.JS
  {
    keywords: ['node', 'nodejs', 'backend', 'server'],
    getResponse: () => `I build backend APIs with Node.js and Express, typically connecting to MongoDB or PostgreSQL databases. Node.js powers my real-time applications and REST APIs.`
  },

  // PYTHON
  {
    keywords: ['python', 'django', 'flask', 'ai', 'ml', 'machine learning'],
    getResponse: () => `I use Python for scripting and automation. While I don't specialize in ML, I can integrate Python backends when needed.`
  },

  // DOCKER
  {
    keywords: ['docker', 'container', 'deployment', 'devops'],
    getResponse: () => `I use Docker for containerizing applications. It makes deployment consistent across environments. I can containerize Node.js, Python, and full-stack applications.`
  },

  // CONTACT
  {
    keywords: ['contact', 'reach', 'email', 'phone', 'call', 'get in touch', 'how to contact', 'connect'],
    getResponse: () => `You can reach me at:\n📧 ${portfolioInfo.email}\n📱 ${portfolioInfo.phone}\nOr use the contact form on my portfolio!`
  },

  // EMAIL
  {
    keywords: ['email', 'mail', 'gmail', 'jdndirangu'],
    getResponse: () => `My email is ${portfolioInfo.email} - I'd love to hear from you!`
  },

  // PHONE
  {
    keywords: ['phone', 'call', 'call me', 'whatsapp'],
    getResponse: () => `You can reach me at ${portfolioInfo.phone}. I'm also available on WhatsApp!`
  },

  // RESPONSE TIME
  {
    keywords: ['response time', 'how long to reply', 'when do you reply', 'reply'],
    getResponse: () => `I typically respond within ${portfolioInfo.responseTime}. For urgent matters, feel free to call or WhatsApp me directly!`
  },

  // PROJECTS
  {
    keywords: ['projects', 'portfolio', 'work', 'built', 'created', ' apps', 'websites', 'applications', 'demos'],
    getResponse: () => `Some of my key projects include:\n• ${portfolioInfo.projects[0].name} - ${portfolioInfo.projects[0].desc}\n• ${portfolioInfo.projects[1].name} - ${portfolioInfo.projects[1].desc}\n• ${portfolioInfo.projects[2].name} - ${portfolioInfo.projects[2].desc}\n\nCheck my Projects page for more!`
  },

  // SOLEASE
  {
    keywords: ['solease', 'itsm', 'ticketing', 'support system'],
    getResponse: () => `SOLEASE is a comprehensive ITSM (IT Service Management) platform I built with React 19, Node.js, MongoDB. It features role-based access control, automated ticketing workflows, and real-time analytics. It also has API documentation!`
  },

  // GREATWALL
  {
    keywords: ['greatwall', 'web3', 'blockchain', 'energy'],
    getResponse: () => `Greatwall is a Web3 energy protocol merging AI with blockchain technology to decentralize the power grid in Kenya. Built with React, Tailwind, and Web3.js.`
  },

  // FRANATECH
  {
    keywords: ['franatech', 'frana', 'corporate'],
    getResponse: () => `Franatech is a corporate website I built for a client. It features a modern design, responsive layout, and contact integration. Check out my Projects page to see the live site!`
  },

  // SOME OF YOUR WORK
  {
    keywords: ['show me your work', 'see work', 'examples', 'portfolio website'],
    getResponse: () => `You can explore my work right here on my portfolio! Navigate to the Projects page to see detailed case studies of SOLEASE, Greatwall, Franatech, and more. Each project includes tech stack and descriptions.`
  },

  // EXPERIENCE
  {
    keywords: ['experience', 'years', 'how long', 'career', 'background'],
    getResponse: () => `I have ${portfolioInfo.experience} of experience as a Full-Stack Developer. I've worked on various projects from corporate websites to complex ITSM platforms and Web3 applications.`
  },

  // AVAILABILITY
  {
    keywords: ['available', 'hiring', 'job', 'work', 'employment', 'opportunity', 'freelance', 'contract'],
    getResponse: () => `I'm ${portfolioInfo.availability}! Feel free to reach out if you have a project in mind or job opportunity.`
  },

  // CAN I HIRE YOU
  {
    keywords: ['can i hire', 'can i book', 'book you', 'need developer'],
    getResponse: () => `Absolutely! I'm ${portfolioInfo.availability}. Send me a message with your project details at ${portfolioInfo.email} and I'll get back to you within ${portfolioInfo.responseTime}!`
  },

  // REMOTE WORK
  {
    keywords: ['remote', 'remote work', 'work remotely', 'from home'],
    getResponse: () => `Yes! I'm open to remote work. I have a reliable internet connection and can collaborate with teams across different time zones using tools like Slack, Zoom, and GitHub.`
  },

  // LOCATION
  {
    keywords: ['where', 'location', 'kenya', 'nairobi', 'based', 'live'],
    getResponse: () => `I'm based in ${portfolioInfo.location}. I'm open to remote work and collaboration with teams worldwide!`
  },

  // GITHUB
  {
    keywords: ['github', 'code', 'repository', 'repo'],
    getResponse: () => `You can check out my code at ${portfolioInfo.github} - feel free to explore and star any projects you like!`
  },

  // LINKEDIN
  {
    keywords: ['linkedin', 'profile', 'resume'],
    getResponse: () => `You can find my LinkedIn at ${portfolioInfo.linkedin} for my professional profile and work history.`
  },

  // HIRE ME
  {
    keywords: ['hire', 'hire me', 'recruit', 'want to hire'],
    getResponse: () => `Great to hear you're interested! I'm available for freelance projects, full-time positions, and contract work. Send me an email at ${portfolioInfo.email} and let's discuss!`
  },

  // COST / RATE
  {
    keywords: ['cost', 'price', 'rate', 'budget', 'how much'],
    getResponse: () => `My hourly rate ranges around ${portfolioInfo.hourlyRate}. Project rates vary depending on scope and complexity. Send me the details at ${portfolioInfo.email} and I'll provide a quote!`
  },

  // HOW MUCH Charge
  {
    keywords: ['how much do you charge', 'pricing', 'quote', 'estimate'],
    getResponse: () => `I offer competitive rates based on project scope. For a more accurate quote, tell me about your project requirements. I typically charge ${portfolioInfo.hourlyRate}/hour for freelance work. Email me at ${portfolioInfo.email} to discuss!`
  },

  // TURNAROUND TIME
  {
    keywords: ['how long', 'timeline', 'deadline', 'when done', 'delivery'],
    getResponse: () => `Turnaround time depends on project scope. A simple landing page takes 1-3 days, while complex web apps take 2-6 weeks. I'll provide a timeline estimate after discussing your requirements.`
  },

  // CV / RESUME
  {
    keywords: ['cv', 'resume', 'document', 'pdf'],
    getResponse: () => `You can download my CV from the home page of my portfolio - just look for the "Download CV" button!`
  },

  // DOWNLOAD CV
  {
    keywords: ['download cv', 'download resume', 'get cv', 'get resume'],
    getResponse: () => `Head to the home page of this portfolio and look for the "Download CV" button! It contains my full work history, skills, and projects.`
  },

  // GREETING
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'what\'s up', 'sup'],
    getResponse: () => `Hello! 👋 I'm James's AI assistant. How can I help you today? Feel free to ask about my projects, skills, or how to get in touch!`
  },

  // WHO ARE YOU
  {
    keywords: ['who are you', 'what are you', 'are you real'],
    getResponse: () => `I'm an AI assistant for ${portfolioInfo.name}'s portfolio! I'm here to answer questions about his skills, projects, and how to contact him. I can help you learn more about his work and availability.`
  },

  // THANK YOU
  {
    keywords: ['thanks', 'thank you', 'appreciate', 'thx'],
    getResponse: () => `You're welcome! 😊 Happy to help. Let me know if you have any other questions!`
  },

  // GOODBYE
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', '结束'],
    getResponse: () => `Goodbye! It was nice chatting with you. Feel free to come back anytime. Have a great day! 👋`
  },

  // HELP
  {
    keywords: ['help', 'what can you do', 'capabilities', 'how can you help'],
    getResponse: () => `I can help you with:\n• Information about my skills and projects\n• How to contact James\n• My availability for work\n• Project pricing and timelines\n• Any questions about my portfolio\n\nWhat would you like to know?`
  },

  // WHAT ELSE CAN YOU DO
  {
    keywords: ['anything else', 'more info', 'tell me more'],
    getResponse: () => `Here are more things I can help with:\n• Technical questions about my stack\n• Project case studies\n• Response time and availability\n• Remote work capabilities\n• Pricing and quotes\n\nJust ask!`
  },

  // WEBSITE HELP
  {
    keywords: ['website', 'web app', 'web application', 'build website'],
    getResponse: () => `I can build websites and web applications! From landing pages to full-stack apps. Check my Projects page for examples of my work including SOLEASE (ITSM) and Greatwall (Web3).`
  },

  // DEVELOPER CAREER ADVICE
  {
    keywords: ['developer advice', 'starting tech', 'starting developer', 'new developer', 'begin developer', 'becoming developer', 'how to start coding', 'learn to code', 'learn programming'],
    getResponse: () => `Great question! Here's my advice for starting in tech:\n\n1️⃣ Pick ONE language and master the basics first - JavaScript or Python are great choices\n2️⃣ Build projects, not just tutorials - real learning happens by making things\n3️⃣ Learn Git and GitHub early - version control is essential\n4️⃣ Join developer communities - Stack Overflow, Discord, Reddit\n5️⃣ Don't compare yourself to seniors - everyone started somewhere\n\nConsistency beats intensity. Code a little every day! Want specific advice on a particular area?`
  },

  // DATA ANALYST ADVICE
  {
    keywords: ['data analyst', 'data analysis', 'analyst career', 'become analyst', 'data science', 'data analytics'],
    getResponse: () => `Data analytics is a fantastic career path! Here's my guide:\n\n📊 Core Skills:\n• Excel/Sheets - master pivot tables & formulas\n• SQL - essential for data extraction\n• Python or R - for analysis & visualization\n• Tableau/Power BI - for dashboards\n\n📈 Learning Path:\n1. Start with Excel, move to SQL\n2. Learn Python basics (pandas, numpy)\n3. Practice with real datasets (Kaggle has free datasets)\n4. Build a portfolio with 2-3 projects\n\n💡 Tip: Show your work with clear visualizations and stories. Good analysts tell compelling data stories! Interested in this path?`
  },

  // TECH CAREER GENERAL
  {
    keywords: ['tech career', 'career in tech', 'tech job', 'tech industry', 'working in tech', 'tech job advice'],
    getResponse: () => `Tech careers are rewarding but require commitment. Here's my perspective:\n\n🚀 What's great about tech:\n• High demand & remote options\n• Continuous learning keeps it exciting\n• Good earning potential\n• Problem-solving daily\n\n⚠️ Challenges:\n• Technology changes fast - always learning\n• Can be sedentary\n• Imposter syndrome is real\n\n💡 My advice: Pick a specialization you enjoy, build skills consistently, and network. The tech community is welcoming to those who show initiative.`
  },

  // PROGRAMMING TIPS
  {
    keywords: ['programming tips', 'code tips', 'coding tips', 'better at coding', 'improve coding', 'write better code'],
    getResponse: () => `Here are my top tips for writing better code:\n\n1️⃣ Read code before writing - understand the problem first\n2️⃣ Keep functions small - do one thing well\n3️⃣ Name variables clearly - future you will thank present you\n4️⃣ Comment WHY, not WHAT - code shows what, comments explain why\n5️⃣ Learn debugging - half of coding is fixing bugs\n6️⃣ Build incrementally - test as you go\n\n📚 Resources: FreeCodeCamp, The Odin Project, CS50 are great starting points. What's your current stack?`
  },

  // JOB INTERVIEW TECH
  {
    keywords: ['tech interview', 'coding interview', 'interview prep', 'job interview', 'interview tips', 'technical interview'],
    getResponse: () => `Tech interviews can be tough but preparation is key:\n\n📋 Common Interview Types:\n• Technical coding challenges (LeetCode/HackerRank)\n• System design for seniors\n• Behavioral questions (STAR method)\n• Portfolio review\n\n💡 Preparation Tips:\n1. Practice 2-3 coding problems daily\n2. Review your portfolio projects deeply\n3. Prepare 3-5 STAR stories\n4. Research the company beforehand\n5. Prepare thoughtful questions for them\n\n🤝 Soft skills matter too - communicate your thinking process. Need help with a specific interview type?`
  },

  // DEEP DIVE
  {
    keywords: ['deep dive', 'deepdive', 'deep insight', 'project deep dive', 'technical deep dive', 'project insight'],
    getResponse: () => `Ready for a technical deep dive? 🎯

I can explore James's projects with you in-depth, focusing on:
• **Frontend** — component architecture, state management, styling, performance
• **Backend** — API design, databases, auth, security, scalability
• **Fullstack** — end-to-end architecture, data flow, deployment
• **Software Engineering** — system design, testing, code quality, trade-offs

Just click one of the "Deep Dive" options in the chat menu, and ask me anything about the project internals — I'll give you a detailed technical analysis!

Or you can email ${portfolioInfo.email} for a more in-depth discussion.`
  },

  // FREELANCE ADVICE
  {
    keywords: ['freelance', 'freelancing', 'freelance developer', 'freelance advice', 'start freelancing'],
    getResponse: () => `Freelancing has great perks but requires discipline:\n\n💰 Pros:\n• Flexibility & autonomy\n• Potentially higher earnings\n• Choose your projects\n\n⏰ Cons:\n• No paid leave\n• Must handle your own taxes & benefits\n• Marketing is also your job\n\n📋 Getting Started:\n1. Build 2-3 portfolio projects first\n2. Start on Upwork/Fiverr or direct outreach\n3. Set clear boundaries & rates\n4. Always get contracts signed\n5. Build relationships for referrals\n\n💡 Tip: Start part-time while employed, validate demand, then transition!`
  },

  // NOT UNDERSTAND (fallback)
  {
    keywords: [],
    getResponse: () => `I'm not sure I understood that one! 😅 Try asking about:\n• My skills or projects\n• How to contact me\n• My availability for work\n• Pricing\n\nOr you can email me directly at ${portfolioInfo.email}!`
  }
];

export function findBestMatch(userMessage: string): FAQ | null {
  const lowercaseMessage = userMessage.toLowerCase();
  
  let bestMatch: FAQ | null = null;
  let highestMatchCount = 0;

  for (const faq of faqKnowledgeBase) {
    const matchCount = faq.keywords.filter(keyword => 
      lowercaseMessage.includes(keyword.toLowerCase())
    ).length;

    if (matchCount > highestMatchCount) {
      highestMatchCount = matchCount;
      bestMatch = faq;
    }
  }

  return bestMatch;
}

export function buildFAQContextString(): string {
  return faqKnowledgeBase
    .filter(faq => faq.keywords.length > 0)
    .map(faq => {
      const keywords = faq.keywords.join(", ");
      const response = faq.getResponse();
      return `Q: ${keywords}\nA: ${response}`;
    })
    .join("\n\n");
}

export async function generateResponse(
  userMessage: string,
  context?: FAQContext
): Promise<string> {
  const matchedFAQ = findBestMatch(userMessage);
  
  if (matchedFAQ && matchedFAQ.keywords.length > 0) {
    const faqResponse = matchedFAQ.getResponse(undefined, context);
    
    if (isGeminiConfigured()) {
      const improved = await improveFAQResponse(faqResponse, userMessage);
      return improved;
    }
    
    return faqResponse;
  }
  
  if (isGeminiConfigured()) {
    const faqContext = buildFAQContextString();
    return await generateGeminiResponse(userMessage, faqContext);
  }
  
  const fallbackFAQ = faqKnowledgeBase[faqKnowledgeBase.length - 1];
  return fallbackFAQ.getResponse();
}

export function buildDeepDiveProjectContext(focus?: string): string {
  const relevant = focus
    ? PROJECTS.filter(p => p.category === focus || p.category === 'fullstack')
    : PROJECTS;

  return relevant.map(p => {
    return `
## ${p.name} (${p.category}, ${p.status})
**Stack:** ${p.techStack.map(t => `${t.name} — ${t.purpose}`).join(' | ')}
**Architecture:** ${p.architecture}
**Frontend:** ${p.frontendDetails.stateManagement} | ${p.frontendDetails.componentArchitecture} | ${p.frontendDetails.stylingApproach}
**Backend:** ${p.backendDetails.apiDesign} | ${p.backendDetails.authStrategy} | Schema: ${p.backendDetails.databaseSchema}
**Security:** ${p.backendDetails.securityConsiderations.join('; ')}
**Design Decisions:** ${p.designDecisions.map(d => `- ${d.decision}: ${d.rationale} (trade-off: ${d.tradeoffs})`).join('\n')}
**Challenges:** ${p.challenges.map(c => `- ${c.problem} → ${c.solution}`).join('\n')}
**Code Quality Gaps:** ${p.codeQuality.notableGaps.join('; ')}
`.trim();
  }).join('\n');
}

function buildLocalDeepDiveResponse(
  userMessage: string,
  focus: string,
  _projectContext: string
): string {
  const msg = userMessage.toLowerCase();
  const focusLabel = focus.charAt(0).toUpperCase() + focus.slice(1);

  const isSecurity = /security|auth|vulnerab|password|xss|csrf|jwt|encrypt|protect|threat|hack|exploit/.test(msg);
  const isStateMgmt = /state management|zustand|redux|context|store|state/.test(msg);
  const isStyling = /styling|tailwind|css|daisyui|shadcn|theme|design|ui librar/.test(msg);
  const isArchitecture = /architect|pattern|structure|monorepo|mvc|spa|component|folder|organi/.test(msg);
  const isApi = /api|rest|endpoint|backend|server|express|route/.test(msg);
  const isTesting = /test|testing|coverage|jest|vitest|cypress|qa|quality/.test(msg);
  const isDatabase = /database|db|sql|nosql|mongo|postgres|schema|migration|orm|prisma/.test(msg);
  const isDeployment = /deploy|ci.?cd|devops|vercel|docker|host|infra/.test(msg);
  const isPerformance = /performance|optimize|bundle|load|speed|fast|lazy|chunk/.test(msg);
  const isAccessibility = /accessib|a11y|screen reader|keyboard nav|aria|inclusiv/.test(msg);
  const isComparison = /compare|difference|between|vs|versus|better|pros and cons|tradeoff/.test(msg);
  const isCodeQuality = /code quality|technical debt|tech debt|refactor|clean code|maintain/.test(msg);

  const allProjects = PROJECTS;
  const p = (name: string) => allProjects.find(pr => pr.name.toLowerCase().includes(name.toLowerCase()));
  const pmap = (fn: (p: typeof PROJECTS[number]) => string) => allProjects.map(fn).join("\n");

  if (isSecurity) {
    const solease = p("solease");
    const eticket = p("eticketing");
    const greatwall = p("greatwall");
    return `## 🔒 ${focusLabel} Deep Dive — Security Considerations

Security across James's projects reveals a wide spectrum of maturity — from production-grade practices in SOLEASE to critical gaps in eticketing. Here's the landscape:

**Authentication Strategies:**
${solease ? `• **SOLEASE** uses JWT in HTTP-only cookies (7-day expiry) with a "Remember Me" 30-day crypto token fallback. This is the gold standard — HTTP-only cookies prevent XSS token theft, and sameSite:strict mitigates CSRF. OAuth (Google + GitHub) is also supported as an alternative auth path.` : ""}
${eticket ? `• **eticketing** uses 5 cookies (username, useremail, usertype, status, uid) with **no HttpOnly or Secure flags**. The usertype cookie is never re-verified against the database — a user can trivially escalate privileges by editing their cookies. Passwords are stored in varchar(13) with no hashing.` : ""}
• **Greatwall** and **HOSPITABILITY** have no authentication at all — they're public static sites.

**Common Vulnerability Patterns:**
${solease ? `• **SOLEASE** avoids SQL injection via Prisma ORM (parameterized queries by default), but lacks a centralized error handler — error details could leak in inconsistent response formats. No CSRF tokens (relies on sameSite:strict only).` : ""}
${eticket ? `• **eticketing** has the most critical gaps: direct SQL string interpolation (no parameterized queries), display_errors enabled in production, no CSRF protection, and plaintext passwords. This is suitable only for isolated/internal networks.` : ""}

**Security-as-a-Spectrum Insight:**
The interesting pattern here is that security robustness correlates directly with **framework choice** rather than developer awareness. SOLEASE uses Prisma (which enforces parameterized queries) and Express with middleware chains — the framework nudges toward security. eticketing uses raw PHP/MySQL with no framework — every security decision was manual and most were skipped. Greatwall and Franatech have no backend at all, so their attack surface is zero but capability is limited.

**Key Recommendation:** The single highest-ROI security investment across all projects would be adding **parameterized queries** (eticketing) and **centralized error handling** (SOLEASE). Everything else follows from those foundations.`;
  }

  if (isStateMgmt) {
    const solease = allProjects.find(p => p.name === "SOLEASE");
    const greatwall = allProjects.find(p => p.name === "Greatwall");
    return `## 🏗️ ${focusLabel} Deep Dive — State Management Patterns

James's projects demonstrate three distinct state management philosophies, each appropriate for different scales:

**1. Zustand (SOLEASE) — Domain-Driven Stores**
${solease ? `SOLEASE uses 6 small Zustand stores (auth, ticket, notification, admin, profile, personalNote) instead of one monolithic store. This is a deliberate choice over Redux — less boilerplate, simpler API. However, cross-store communication via Zustand's vanilla \`getState()\` API creates implicit dependencies (e.g., authStore calling notificationStore). This is fine for the current scale but would benefit from an event bus or middleware as the app grows.` : ""}

**2. React Context (Greatwall) — Minimalist Approach**
${greatwall ? `Greatwall uses React Context with only 2 fields: \`isWalletConnected\` and \`isDarkMode\`. The original decision memo says "Context was sufficient" — and for a marketing site with virtually no interactive state, it's correct. But the code itself documents the trade-off: "Context causes re-renders of all consumers on any state change. Would not scale to real-time energy data or complex user interactions." This is honest technical debt documentation.` : ""}

**3. No State Management (Franatech, eticketing, Open Weather)**
Franatech is fully static (no JS state needed). eticketing uses PHP sessions via cookies. Open Weather uses React's useState/useEffect — component-local state, no global store. Each is appropriate for its scale.

**Comparative Insight:**
The progression from **no state lib → Context → Zustand** mirrors a project's growth in complexity. The key architectural lesson from SOLEASE is that **store boundaries should mirror domain boundaries**, not technical layers. Each Zustand store represents a business domain (auth, tickets, notifications), which makes them independently testable and refactorable — even if the cross-store communication isn't perfectly clean yet.`;
  }

  if (isStyling) {
    return `## 🎨 ${focusLabel} Deep Dive — Styling Approaches

James's projects are a living comparison of CSS methodologies. Let me break them down:

**Tailwind CSS + Component Libraries (Modern Stack)**
• **SOLEASE** uses a triple-stack: Tailwind CSS (utility layer), DaisyUI (component themes), and shadcn/ui (Radix-based accessible primitives). Dark/light mode via CSS custom properties toggled by \`next-themes\`. This gives maximum flexibility but has a learning curve — knowing which layer to use for what takes experience.
• **Greatwall** and **HOSPITABILITY** both use Tailwind with custom theming. Greatwall hardcodes its brand color (#135bec) extensively rather than using CSS variables — a maintenance smell when the brand evolves.
• **HOSPITABILITY** uses Tailwind v4's \`@theme\` directive, which eliminates PostCSS config complexity and scopes design tokens declaratively within CSS. This is the most modern approach in the portfolio.

**Bootstrap Era (Maintenance Mode)**
• **Franatech** uses Bootstrap 5 with CSS Custom Properties for theming. The CSS is ~450 lines of custom overrides on top of Bootstrap's grid. jQuery is still a dependency (87KB) for carousels and animations — pure overhead by modern standards.
• **eticketing** uses Bootstrap 3.3.7 (from 2013!) with custom CSS and a localStorage-based dark mode toggle. The dark mode is surprisingly well-implemented for such an old foundation.

**Architectural Insight:**
The evolution from Bootstrap CSS → Tailwind utility classes → Tailwind + shadcn/ui primitives shows a clear industry trend: **separation of visual design (Tailwind) from behavior/accessibility (Radix/shadcn)**. The triple-stack in SOLEASE is forward-looking but adds complexity — you're debugging DaisyUI theme overrides on top of Tailwind utilities on top of shadcn's Radix primitives, and figuring out which layer is causing a visual glitch can be time-consuming.

**Recommendation:** Adopt the HOSPITABILITY approach (Tailwind v4 + \`@theme\`) as the baseline. Add shadcn/ui only for components that genuinely need Radix's accessibility (dialogs, dropdowns, popovers). Skip DaisyUI unless a consistent component theme library is needed for rapid prototyping.`;
  }

  if (isArchitecture || isComparison) {
    const solease = allProjects.find(p => p.name === "SOLEASE");
    const greatwall = allProjects.find(p => p.name === "Greatwall");
    const franatech = allProjects.find(p => p.name === "Franatech Website");
    return `## 🏛️ ${focusLabel} Deep Dive — Architecture Patterns

James's projects span four distinct architectural paradigms. Here's the landscape:

**1. Monorepo SPA (SOLEASE)**
${solease ? `SOLEASE is a monorepo with \`backend/\` (Express 5 REST API + Prisma + PostgreSQL) and \`frontend/\` (React 19 SPA + Vite + Zustand). Routes use ProtectedRoute wrappers with \`allowedRoles\` arrays for RBAC. The backend follows a route-controller-utility pattern with middleware chains. This is the most sophisticated architecture in the portfolio — suitable for a production SaaS product.` : ""}

**2. Static Marketing SPA (Greatwall, HOSPITABILITY, Open Weather)**
These are client-side SPAs with no backend. Greatwall and HOSPITABILITY use React Router for navigation; all content is hardcoded. Deployment is trivial (Vercel static hosting) but capability is limited — no auth, no persistence, no personalization.

**3. Multi-Page Static (Franatech)**
11 standalone HTML files with zero client-side routing. Every page duplicates the navbar, footer, and scripts. This is the simplest possible architecture and the most expensive to maintain — any nav change requires editing all 11 files.

**4. Procedural PHP Monolith (eticketing)**
Single-file role dashboards with hash-based tab navigation. No MVC, no ORM, no routing framework. Business logic and HTML are interleaved in single files.

**Architectural Trade-off Analysis:**
The key insight is that **architectural complexity should match project maturity and team size**. SOLEASE's monorepo + RBAC + middleware chains would be over-engineering for Greatwall (a marketing prototype). Franatech's copy-paste HTML pattern is actually the right call for a 5-page corporate site — it deploys to any server with zero build step.

**What I'd recommend for each:**
• **SOLEASE**: Extract shared types into a \`shared/\` package; consider tRPC or GraphQL if API endpoint count grows beyond 50+
• **Greatwall/HOSPITABILITY**: The static SPA pattern is ideal — add a headless CMS (Sanity, Strapi) if content needs to be editable without redeploying
• **Franatech**: Convert to a static site generator (Astro, Eleventy) with partials/layouts to eliminate the 11-file duplication
• **eticketing**: Full rewrite to a modern framework (Laravel or Express) — the security debt alone justifies it`;
  }

  if (isTesting) {
    return `## 🧪 ${focusLabel} Deep Dive — Testing & Code Quality

This is the most consistent finding across all projects: **zero automated test coverage**. Let me be direct about what this means:

**Current State:**
• **SOLEASE** has test badges in its README but no actual test files — no Jest, Vitest, or Cypress. The codebase relies entirely on manual testing.
• **Greatwall, Franatech, Open Weather, eticketing, HOSPITABILITY** — none have any test setup whatsoever.
• The only project with test infrastructure mentioned is SOLEASE (badges suggest plans), but it's unimplemented.

**Why This Matters:**
Without tests, every refactoring is risky. The 228KB component files in SOLEASE, the code duplication in Greatwall (FAQItem copied across pages), and the missing dataEdit.php in eticketing are all symptoms of the same root cause: **no safety net means no one dares refactor**. Code grows but never shrinks.

**What I'd Prioritize (Highest ROI First):**
1. **Add Vitest to SOLEASE** — it has the most complex logic (state management, RBAC, API integration). Start with the Zustand stores (pure functions = easy to test).
2. **Cypress for Greatwall** — minimal setup for a static SPA, catches regression bugs in the page routing and component rendering.
3. **PHPUnit for eticketing** — the security-critical code (auth, SQL queries) needs tests most urgently.

**The Hard Truth:** James's portfolio shows strong engineering intuition in architecture and design, but the testing gap is the single biggest professional risk. A hiring manager or client reviewing this codebase will ask: "How do you know this works?" — and "manual testing" is not a convincing answer for production software.`;
  }

  if (isDatabase) {
    return `## 🗄️ ${focusLabel} Deep Dive — Database Decisions

The database story across these projects is actually one of the most interesting — it documents a real migration and the lessons learned:

**PostgreSQL (SOLEASE — Current)**
SOLEASE originally used MongoDB Atlas (free tier) but migrated to PostgreSQL when Atlas auto-paused the cluster after 30 days of inactivity, causing irreversible data loss. The migration required rewriting all models from Mongoose to Prisma schema — a significant effort that the developer notes as "a critical lesson in cloud database reliability."

The current PostgreSQL schema has 12 Prisma models with complex relationships (cascade deletes, ~35-field User model including presence tracking, plan tiers, AI usage counters). The trade-off is that schema migrations are more rigid than MongoDB's flexible documents, but the reliability gain is substantial.

**No Database (Greatwall, Franatech, HOSPITABILITY)**
All three store content hardcoded in JSX or HTML files. This is perfectly appropriate for their scale — zero database cost, zero schema management, instant page loads. The trade-off is that any content change requires a code deployment.

**MySQL (eticketing)**
3 tables (users, complaints, usertypes) with no foreign key constraints. The schema stores passwords in varchar(13) — a 13-character limit is a red flag for security (bcrypt hashes are 60 characters). No indexes mentioned, no cascade operations.

**Key Architectural Insight:**
The migration from MongoDB → PostgreSQL in SOLEASE illustrates a real-world trade-off that doesn't get enough attention in tutorials: **free-tier database reliability**. MongoDB Atlas is excellent at scale, but its free tier auto-pausing is a trap for solo developers and prototypes. PostgreSQL via Supabase or Neon offers more reliable free tiers with no data loss risk — which is why James switched.

**Recommendation:** For future projects, consider SQLite (via Turso/LibSQL) for prototypes — zero-config, no server needed, and can scale to production without migration.`;
  }

  if (isApi) {
    return `## 🔌 ${focusLabel} Deep Dive — API Design & Backend Patterns

The portfolio shows three fundamentally different approaches to API design:

**RESTful API (SOLEASE)**
~50+ endpoints under \`/sol/\` base path, organized by domain (auth, admin, ticket, profile, notification, ai, oauth). Express 5 with route-level middleware chains (verifyToken, rateLimiter, upload). This is standard REST — resource-oriented URLs, HTTP methods for CRUD. The inconsistency between \`/sol/\` and \`/api/auth/\` (OAuth routes use a different convention) is noted as a code quality gap.

**No Custom API (Greatwall, Franatech, HOSPITABILITY)**
These rely on third-party services (EmailJS, Web3Forms) called directly from the browser. API keys are exposed via VITE_ environment variables — acceptable for these services (they use domain whitelisting) but would be unacceptable for sensitive APIs.

**Form-Based Data Exchange (eticketing)**
No REST — just form POSTs and AJAX requests to PHP files that return empty 200 OK. No JSON, no standardized response format. This is the most primitive approach and the hardest to debug or extend.

**Comparative Insight:**
The progression form-based → REST → third-party-service shows that James adapts API complexity to project needs. SOLEASE's REST API is the most sophisticated, but the \`/sol/\` vs \`/api/auth/\` inconsistency and lack of centralized error handling suggest the API grew organically rather than from a design-first approach. Adding an API contract (OpenAPI spec) would prevent route drift and make the 50+ endpoints documentable.`;
  }

  if (isPerformance) {
    return `## ⚡ ${focusLabel} Deep Dive — Performance & Optimization

Performance considerations vary dramatically by project type:

**Bundle Size (SPA Projects):**
• **SOLEASE**: The app has three component files over 100KB (228KB ClientReportPage, 128KB AdminReportPage, 124KB another). This is the biggest performance red flag — these monolithic components increase bundle size, slow initial loads, and make code-splitting ineffective. The current strategy is "split by feature going forward, leave legacy intact" — pragmatic but leaves existing tech debt.
• **Greatwall**: Uses lazy-loaded routes via React Router and Framer Motion's \`whileInView\` for scroll-triggered animations. Heavy use of staggered entrance animations can cause layout thrashing on lower-end devices.
• **This portfolio itself**: The 797KB vendor bundle (MUI X-Charts, Framer Motion) is the largest in the portfolio — a pre-existing chunk size warning.

**Static Sites (Franatech, HOSPITABILITY):**
These are inherently fast — no JS framework overhead, no client-side rendering. Franatech's CDN dependencies (jQuery, Bootstrap JS) create a single point of failure but have minimal performance impact if cached properly.

**Key Recommendations:**
1. Split the 228KB SOLEASE components by domain — even a simple route-level code-split would halve initial load time for users who don't need reporting
2. Add bundle analysis to the build pipeline (\`vite-plugin-visualizer\`) so bundle regressions are visible in every build
3. For Greatwall's animations, use \`will-change\` and \`content-visibility: auto\` to reduce layout impact of staggered entrance animations`;
  }

  if (isAccessibility) {
    return `## ♿ ${focusLabel} Deep Dive — Accessibility

Accessibility is consistently the weakest area across all projects. This is common for solo developers but is a meaningful gap:

**What's Done:**
• **SOLEASE**: shadcn/ui provides basic aria attributes on its primitives (dialogs, dropdowns, sheets). The ProtectedRoute pattern naturally supports keyboard navigation for role-based access.
• **Greatwall**: Mobile menu has keyboard navigation. Some buttons have aria-labels.
• **Franatech**: Semantic HTML structure provides baseline support. Color contrast not systematically verified.
• **Open Weather**: Headless UI provides baked-in accessibility (keyboard navigation, screen reader support). Loading states announced to screen readers.

**What's Missing:**
• No project has systematic screen reader testing
• Keyboard navigation is inconsistently implemented — some interactive elements lack focus indicators
• No aria-live regions for dynamic content updates in SPAs
• Color contrast ratios are not verified against WCAG 2.1 AA standards
• Error messages are not announced to screen readers

**Quick Wins (in order of impact):**
1. Add \`aria-live="polite"\` to notification toasts and loading states in SOLEASE
2. Run axe DevTools on all projects — it catches 80% of common issues in 5 minutes
3. Ensure all interactive elements have visible \`:focus-visible\` styles (Tailwind's \`focus:ring\` helps but isn't always applied)
4. Add skip-to-content links for keyboard users

The good news is that adding accessibility retroactively is well-understood work — it's not technically difficult, just methodical. WCAG 2.1 AA compliance is achievable within a sprint for any single project.`;
  }

  if (isCodeQuality) {
    return `## 📐 ${focusLabel} Deep Dive — Code Quality & Technical Debt

James's projects are honest about their code quality gaps — the data even documents them explicitly. Here's the pattern:

**Recurring Themes Across Projects:**
1. **No tests anywhere** — the single biggest quality gap. SOLEASE has test badges but no actual test files.
2. **Dead code** — Greatwall has an unused Hero component and undefined \`anomalyAlert\` context property. HOSPITABILITY has a duplicate CSS file. eticketing has a missing \`dataEdit.php\` file that breaks admin user editing.
3. **Code duplication** — FAQItem component duplicated in Greatwall's HomePage and AboutPage. Franatech's navbar/footer copied across 11 HTML files.
4. **Inconsistent error handling** — SOLEASE lacks centralized error middleware; each controller has its own try/catch with inconsistent response formats.

**What This Tells Me:**
These patterns are characteristic of a **solo developer building in public** — features ship first, cleanup happens when it blocks new work. The presence of explicit "notable gaps" documentation is actually a positive sign: James knows where the debt is. The risk is that these gaps compound over time — dead code discourages refactoring, duplication makes changes risky, and untested code is fragile.

**Highest-ROI Fixes:**
1. Remove dead code (Greatwall's Hero component, HOSPITABILITY's styles.css) — zero risk, immediate payoff
2. Add Vitest to one Zustand store in SOLEASE — proves the testing pattern, makes the next store easy
3. Extract Greatwall's FAQItem to a shared component — demonstrates component hygiene in under 50 lines of work
4. Remove deprecated Mongoose models from SOLEASE's codebase — eliminates developer confusion`;
  }

  let generalAnalysis = "";
  if (focus === "frontend") {
    const hasTailwind = allProjects.some(p =>
      p.frontendDetails.stylingApproach.toLowerCase().includes("tailwind")
    );
    const hasZustand = allProjects.some(p =>
      p.frontendDetails.stateManagement.toLowerCase().includes("zustand")
    );
    const hasContext = allProjects.some(p =>
      p.frontendDetails.stateManagement.toLowerCase().includes("context")
    );
    const hasShadcn = allProjects.some(p =>
      p.frontendDetails.stylingApproach.toLowerCase().includes("shadcn")
    );

    const statePatterns: string[] = [];
    if (hasZustand) statePatterns.push("**Zustand** (SOLEASE) — domain-driven stores with cross-store communication");
    if (hasContext) statePatterns.push("**React Context** (Greatwall) — minimal state for marketing sites");
    statePatterns.push("**useState/useEffect** (Open Weather) — component-local state for simple apps");
    statePatterns.push("**No state management** (Franatech) — fully static HTML pages");

    const stylingPatterns: string[] = [];
    if (hasTailwind) stylingPatterns.push("**Tailwind CSS** — the common thread, used with v3 config, v4 @theme, DaisyUI, and shadcn/ui layers");
    if (hasShadcn) stylingPatterns.push("**shadcn/ui** — Radix-based accessible primitives in SOLEASE");
    stylingPatterns.push("**Bootstrap 5** (Franatech) — legacy approach with CSS custom properties for theming");
    stylingPatterns.push("**Bootstrap 3** (eticketing) — 2013-era styling with localStorage dark mode");

    const componentApproaches = allProjects
      .map(p => `• **${p.name}**: ${p.frontendDetails.componentArchitecture.split(". ")[0] || p.frontendDetails.componentArchitecture}`)
      .slice(0, 4).join("\n");

    generalAnalysis = `## 🎯 ${focusLabel} Deep Dive — Frontend Analysis

**State Management Landscape:**
${statePatterns.map(s => `• ${s}`).join("\n")}

**Styling Ecosystem:**
${stylingPatterns.map(s => `• ${s}`).join("\n")}

**Component Architecture Approaches:**
${componentApproaches}

**Cross-Project Insight:**
The interesting pattern is that frontend complexity is inversely correlated with backend presence. SOLEASE (has a backend) uses the most sophisticated frontend stack — Zustand, shadcn/ui, RBAC routing. Greatwall and HOSPITABILITY (no backend) use simpler React Context or useState patterns. This suggests James correctly scales frontend architecture to match actual application complexity rather than using a one-size-fits-all approach.

**What I'd Explore Next:**
• How the triple-stack styling in SOLEASE (Tailwind + DaisyUI + shadcn/ui) handles theme conflicts in practice
• Whether Zustand's cross-store communication pattern would benefit from an event emitter or middleware layer
• The ProtectedRoute + allowedRoles RBAC pattern and how it composes with React Router 7's loaders and actions`;
  } else if (focus === "backend") {
    generalAnalysis = `## 🎯 ${focusLabel} Deep Dive — Backend Analysis

**API Design Spectrum:**
• **SOLEASE**: Restful Express 5 API with ~50+ endpoints, route-controller-utility pattern, middleware chains for auth/rate-limiting/file-upload
• **eticketing**: Procedural PHP with form-based data exchange, no REST, no JSON — the simplest and least maintainable approach
• **Greatwall / Franatech / HOSPITABILITY**: No backend at all — third-party services (EmailJS, Web3Forms) handle form submissions

**Authentication Approaches:**
• **SOLEASE**: JWT in HTTP-only cookies + OAuth (Google/GitHub) — production-grade
• **eticketing**: Cookie-based with client-trusted roles and plaintext passwords — internal-tool grade
• **Other projects**: No authentication at all

**Error Handling Comparison:**
• **SOLEASE**: Inline try/catch per controller, no centralized error middleware — inconsistent response formats (\`{success: false, message}\` vs \`{error}\`)
• **Open Weather**: Axios interceptor for 401/404/429 — centralized pattern but only for HTTP errors
• **Greatwall**: react-hot-toast for async failures — UI-level handling only
• **eticketing**: PHP \`echo\` for errors, browser \`alert()\` for AJAX — the most primitive

**Key Backend Insight:**
SOLEASE is the only project with a real backend, and it shows — the API surface is large enough that consistency problems have emerged (\`/sol/\` vs \`/api/auth/\` route conventions, inconsistent error responses). This is a natural pain point of organic API growth and would benefit from an API design review and OpenAPI documentation.`;
  } else if (focus === "fullstack") {
    generalAnalysis = `## 🎯 ${focusLabel} Deep Dive — Fullstack Analysis

The fullstack picture spans everything from zero-backend SPAs to monorepo production apps:

**Deployment Diversity:**
• **Vercel**: Greatwall, Franatech, Open Weather, HOSPITABILITY — static or SPA deployments with auto-deploy from GitHub
• **nginx + PM2**: SOLEASE — traditional server with reverse proxy, SSL (Let's Encrypt), PM2 process management
• **XAMPP**: eticketing — local development stack, no production deployment

**Data Flow Patterns:**
• **SOLEASE**: Full CRUD cycle — UI → Zustand → API → Prisma → PostgreSQL → response → state update
• **Greatwall**: Read-only — hardcoded data → React renders. Write: form → third-party service directly
• **Franatech**: Fully static — no data flow at all (forms are visual-only, no action attributes)

**Security Across the Stack:**
This varies enormously — from SOLEASE's HTTP-only cookies and rate limiting (both local express-rate-limit and distributed Upstash Redis) to eticketing's plaintext passwords and client-trusted role cookies. The fullstack security posture is only as strong as the weakest link.

**Fullstack Integration Insight:**
The most architecturally significant decision across all projects is **where to put the backend boundary**. SOLEASE draws it at the API layer (Express → Prisma → PostgreSQL), Greatwall pushes it to third-party services, and Franatech has no boundary at all. Each choice is correct for the project's goals but constrains future evolution — Greatwall can't add real-time features without a backend, and Franatech can't collect user input without one.`;
  } else if (focus === "software") {
    generalAnalysis = `## 🎯 ${focusLabel} Deep Dive — Software Engineering Analysis

**Engineering Maturity Across Projects:**

The portfolio shows clear strengths and consistent gaps:

**Strengths:**
• **Architecture decisions are documented** — design decisions include rationale AND trade-offs, which is rare for solo projects
• **Technology choices are justified** — Zustand over Redux, PostgreSQL migration from MongoDB, HTTP-only cookies over localStorage — each choice has a clear "why"
• **Honest debt documentation** — every project lists its notable code quality gaps explicitly, showing self-awareness

**Consistent Gaps:**
• **Testing**: Zero test coverage across all 7 projects. This is the biggest professional risk.
• **TypeScript adoption**: Only HOSPITABILITY uses TypeScript (strict mode). SOLEASE, the most complex project, uses plain JSX with jsconfig aliases.
• **Dead code management**: Multiple projects have unused components, duplicated files, and orphaned code paths.
• **Error handling**: No project has a centralized, consistent error handling strategy.

**Process Observations:**
The build tooling progression is worth noting: Vite 7 in the three newest projects (SOLEASE, Greatwall, HOSPITABILITY) vs no build tool in Franatech/eticketing. This suggests James has standardized on Vite for all new work, which is a good sign of tooling maturity.

**What I'd Focus On:**
If I were coaching James on engineering growth, the top three areas would be:
1. **Testing habit** — start with one Vitest test for a Zustand store. Once the pattern is proven, it spreads naturally.
2. **TypeScript migration** — convert SOLEASE to .tsx incrementally (file-by-file with \`allowJs\`). The most bug-prone files are the 228KB components — exactly where TypeScript provides the most value.
3. **Refactoring cadence** — dedicate every 4th sprint to paying down debt (remove dead code, extract duplicates, add error boundaries). This prevents the "never refactor" trap that the portfolio's code quality gaps suggest.`;
  } else {
    generalAnalysis = `## 🎯 ${focusLabel} Deep Dive

James's portfolio of ${allProjects.length} projects spans:
• ${allProjects.filter(p => p.category === "frontend").length} frontend-focused projects
• ${allProjects.filter(p => p.category === "backend").length} backend-focused projects
• ${allProjects.filter(p => p.category === "fullstack").length} fullstack projects

**Tech Stack Coverage:**
• **Frontend**: React 19, Vite 7, Tailwind CSS, shadcn/ui, DaisyUI, Framer Motion, TypeScript
• **Backend**: Express 5, Prisma ORM, PostgreSQL, JWT/OAuth, Upstash Redis
• **Legacy**: PHP, MySQL, Bootstrap 3/5, jQuery
• **Deployment**: Vercel, nginx, PM2, Docker

**Ask me something more specific** and I'll give you a deeper analysis — try asking about state management, styling approaches, security, testing, database decisions, or a specific project's architecture.`;
  }

  const conclusion = `\n\n---\n*This analysis is built from the local project knowledge base. ${isGeminiConfigured() ? "The Gemini API is configured and can provide even deeper conversational analysis if the key is valid." : "To get AI-generated deep dive analysis, add a valid \`VITE_GEMINI_API_KEY\` to the \`.env\` file and restart the dev server."}*\n`;

  return generalAnalysis + conclusion;
}

export async function generateDeepDiveResponse(
  userMessage: string,
  focus: string
): Promise<string> {
  const projectContext = buildDeepDiveProjectContext(focus);
  if (!isGeminiConfigured()) {
    return buildLocalDeepDiveResponse(userMessage, focus, projectContext);
  }
  try {
    const response = await generateDeepDiveGemini(userMessage, focus, projectContext);
    if (response.includes("my Gemini API connection")) {
      return buildLocalDeepDiveResponse(userMessage, focus, projectContext);
    }
    return response;
  } catch {
    return buildLocalDeepDiveResponse(userMessage, focus, projectContext);
  }
}

export async function generateResponseWithMetrics(
  userMessage: string,
  context?: FAQContext
): Promise<MetricResult> {
  const matchedFAQ = findBestMatch(userMessage);

  if (matchedFAQ && matchedFAQ.keywords.length > 0) {
    const faqResponse = matchedFAQ.getResponse(undefined, context);

    if (isGeminiConfigured()) {
      const result = await improveFAQResponseWithMetrics(faqResponse, userMessage);
      return result;
    }

    return {
      text: faqResponse,
      latency_ms: 0,
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      model: "faq",
      confidence: 0.85,
    };
  }

  if (isGeminiConfigured()) {
    const faqContext = buildFAQContextString();
    return await generateGeminiResponseWithMetrics(userMessage, faqContext);
  }

  const fallbackFAQ = faqKnowledgeBase[faqKnowledgeBase.length - 1];
  return {
    text: fallbackFAQ.getResponse(),
    latency_ms: 0,
    total_tokens: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    model: "fallback",
    confidence: 0.4,
  };
}

async function improveFAQResponseWithMetrics(
  originalResponse: string,
  userQuestion: string
): Promise<MetricResult> {
  const start = performance.now();
  const improved = await improveFAQResponse(originalResponse, userQuestion);
  const latency_ms = Math.round(performance.now() - start);

  const isImproved = improved !== originalResponse;
  return {
    text: improved,
    latency_ms,
    total_tokens: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    model: "gemini-2.0-flash",
    confidence: isImproved ? 0.85 : 0.5,
  };
}

export async function generateDeepDiveResponseWithMetrics(
  userMessage: string,
  focus: string
): Promise<MetricResult> {
  const projectContext = buildDeepDiveProjectContext(focus);

  if (!isGeminiConfigured()) {
    const localResponse = buildLocalDeepDiveResponse(userMessage, focus, projectContext);
    return {
      text: localResponse,
      latency_ms: 0,
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      model: "local",
      confidence: 0.7,
    };
  }

  try {
    const result = await generateDeepDiveWithMetrics(userMessage, focus, projectContext);
    if (result.text.includes("my Gemini API connection")) {
      const localResponse = buildLocalDeepDiveResponse(userMessage, focus, projectContext);
      return { ...result, text: localResponse, confidence: 0.7 };
    }
    return result;
  } catch {
    const localResponse = buildLocalDeepDiveResponse(userMessage, focus, projectContext);
    return {
      text: localResponse,
      latency_ms: 0,
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      model: "local",
      confidence: 0.5,
    };
  }
}

// Welcome message for new conversations
export const welcomeMessage = `Hi there! 👋 I'm ${portfolioInfo.name}'s AI assistant on his portfolio.

I can help you with:
• Learning about his skills and tech stack
• Details on his projects (SOLEASE, Greatwall, Franatech, and more)
• Contact information and availability
• Pricing and project timelines
      • **Deep Dive Insights 🎯** — explore my projects with deep technical analysis!
    
    Select an option below or just type your question! What would you like to know?`;
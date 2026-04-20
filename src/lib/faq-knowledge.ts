// Portfolio FAQ Knowledge Base for AI Chatbot
// Rule-based keyword matching - no external API required!

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
    { name: "Franatech", desc: "Corporate Website" }
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

  // NOT UNDERSTAND (fallback)
  {
    keywords: [],
    getResponse: () => `I'm not sure I understood that one! 😅 Try asking about:\n• My skills or projects\n• How to contact me\n• My availability for work\n• Pricing\n\nOr you can email me directly at ${portfolioInfo.email}!`
  }
];

// Find the best matching FAQ
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

// Generate response from matched FAQ
export function generateResponse(userMessage: string, context?: FAQContext): string {
  const matchedFAQ = findBestMatch(userMessage);
  
  if (matchedFAQ) {
    return matchedFAQ.getResponse(undefined, context);
  }
  
  // Fallback response
  const fallbackFAQ = faqKnowledgeBase[faqKnowledgeBase.length - 1];
  return fallbackFAQ.getResponse();
}

// Welcome message for new conversations
export const welcomeMessage = `Hi there! 👋 I'm ${portfolioInfo.name}'s AI assistant on his portfolio.

I can help you with:
• Learning about his skills and tech stack
• Details on his projects (SOLEASE, Greatwall, Franatech)
• Contact information and availability
• Pricing and project timelines

Feel free to ask anything! What would you like to know?`;
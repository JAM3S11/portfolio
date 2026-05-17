import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { PROJECTS } from "./project-knowledge";
import type { ProjectTechnicalDetail } from "./project-knowledge";
import type { InterviewRole, InterviewDifficulty, InterviewSession, InterviewFeedback } from "./interview-service";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI responses will be limited.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1024,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

function buildProjectContextString(): string {
  return PROJECTS.map(p => {
    const stack = p.techStack.map(t => `${t.name} — ${t.purpose}`).join(', ');
    const decisions = p.designDecisions.map(d => `- ${d.decision}: ${d.rationale}`).join('\n');
    const challenges = p.challenges.map(c => `- ${c.problem}`).join('\n');
    const gaps = p.codeQuality.notableGaps.map(g => `- ${g}`).join('\n');

    return `${p.name} (${p.category}, ${p.status})
  Description: ${p.description}
  Stack: ${stack}
  Architecture: ${p.architecture}
  Frontend: ${p.frontendDetails.stateManagement} | ${p.frontendDetails.componentArchitecture} | ${p.frontendDetails.stylingApproach}
  Backend: ${p.backendDetails.apiDesign} | ${p.backendDetails.authStrategy} | DB: ${p.backendDetails.databaseSchema}
  Key Design Decisions:
${decisions}
  Challenges:
${challenges}
  Code Quality Gaps:
${gaps}`.trim();
  }).join('\n\n');
}

const portfolioContext = `You are James Daniel's AI portfolio assistant. You help visitors learn about James's services, skills, projects, and how to contact him.

PORTFOLIO INFO:
- Name: James Daniel
- Role: Full-Stack Developer (4+ years experience)
- Location: Kenya
- Email: jdndirangu2020@gmail.com
- Phone: +254 716 041419
- GitHub: https://github.com/JAM3S11
- LinkedIn: https://linkedin.com/in/jamesdaniel

SKILLS:
- Frontend: React.js, Next.js, TypeScript, JavaScript, Tailwind CSS
- Backend: Node.js, Express.js, Python
- Databases: MongoDB, PostgreSQL, Supabase
- Other: Docker, Web3.js

PROJECTS (full technical details):
${buildProjectContextString()}

AVAILABILITY:
- Open to freelance projects, full-time opportunities, contract work
- Remote work friendly
- Hourly rate: $30-50

BEHAVIOR INSTRUCTIONS:
- If the question is about James or his services, answer from the portfolio info above
- If the question is a general conversation (greetings, thanks, goodbye, how are you, etc.), respond naturally and warmly
- If the question is about general tech topics (coding help, programming concepts, etc.), helpfully provide information
- If the question is about ANY project or technical detail, answer with depth using the PROJECTS technical data above — discuss architecture, design decisions, trade-offs, challenges, and code quality
- Go deep on technical questions: don't just describe what was built, explain WHY decisions were made and the trade-offs involved
- If the question is completely unrelated to James or web development, acknowledge politely and gently redirect to portfolio topics
- Always be helpful, friendly, and professional
- Focus on what the customer wants to know
- Guide users toward taking action (contact, hire, explore projects)
- Keep responses conversational but technically precise; 1-3 paragraphs is fine for simple questions, 3-5 paragraphs for deep technical questions
- If you mention contact info, always include email and phone
- For project inquiries, encourage sending project details via email`;

export interface AIResponse {
  text: string;
  source: "faq" | "gemini";
  confidence: number;
}

export async function generateGeminiResponse(
  userMessage: string,
  faqContext?: string
): Promise<string> {
  if (!apiKey) {
    return getFallbackResponse(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig,
      safetySettings,
    });

    const contextPrompt = faqContext
      ? `\n\nKNOWN INFORMATION:\n${faqContext}\n\nUse this information to provide accurate responses. If the user asks about something covered above, reference it naturally.`
      : "";

    const prompt = `${portfolioContext}${contextPrompt}

\n\nUSER QUESTION: ${userMessage}\n\nProvide a helpful, accurate response based on the context above. If the question is covered in the known information, use that. Otherwise, answer based on the general portfolio info.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim() === "") {
      return getFallbackResponse(userMessage);
    }

    return text.trim();
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    return getFallbackResponse(userMessage);
  }
}

function getFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes("how are you") || msg.includes("doing")) {
    return "I'm doing great, thanks for asking! 😊 I'm James Daniel's AI assistant on his portfolio. How can I help you today?";
  }
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return "Hello! 👋 Welcome! I'm James's AI assistant. What would you like to know about his work?";
  }
  if (msg.includes("thank")) {
    return "You're welcome! 😊 Happy to help. Let me know if you have any other questions!";
  }
  if (msg.includes("bye") || msg.includes("goodbye") || msg.includes("later")) {
    return "Goodbye! It was nice chatting with you. Feel free to come back anytime! 👋";
  }
  if (msg.includes("coding") || msg.includes("program") || msg.includes("start")) {
    return "Great question! My advice for starting coding: 1) Pick a language (JavaScript is great for web), 2) Build projects early and often, 3) Don't fear bugs - they're learning opportunities, 4) Join communities like Stack Overflow or Discord. James started with HTML/CSS and built up from there. Want to know more about his journey?";
  }
  if (msg.includes("help") || msg.includes("what can you do")) {
    return "I can help you with:\n• James's skills and projects\n• How to contact him\n• Hiring or project quotes\n• His availability\n\nJust ask! What would you like to know?";
  }
  
  return "That's a great question! I can tell you more about James's services, projects, and how to hire him. Want to learn more about his work?";
}

export async function improveFAQResponse(
  originalResponse: string,
  userQuestion: string
): Promise<string> {
  if (!apiKey) {
    return originalResponse;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig,
      safetySettings,
    });

    const prompt = `You are improving a response for James Daniel's portfolio chatbot.
    
Original question: ${userQuestion}
Original response: ${originalResponse}

Improve this response to be:
- More natural and conversational
- Directly addressing what the user wants to know
- Concise but thorough
- Action-oriented when appropriate

Keep the same facts but make it sound more human and helpful.`;

    const result = await model.generateContent(prompt);
    const improved = result.response.text();

    return improved && improved.trim() !== "" ? improved.trim() : originalResponse;
  } catch {
    return originalResponse;
  }
}

const interviewGenerationConfig = {
  temperature: 0.8,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
};

const feedbackGenerationConfig = {
  temperature: 0.6,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1536,
};

export async function generateInterviewQuestion(
  project: ProjectTechnicalDetail,
  role: InterviewRole,
  difficulty: InterviewDifficulty,
  previousQuestions: string[]
): Promise<string> {
  if (!apiKey) {
    return getFallbackInterviewQuestion(project, role, difficulty);
  }

  const roleFocus = project.interviewFocusAreas[role];
  const difficultyGuide = {
    junior: "Test understanding of fundamentals, basic concepts, and how specific features work. Expect the candidate to explain their reasoning clearly.",
    mid: "Test understanding of trade-offs, design decisions, and architectural choices. Expect the candidate to compare alternatives and justify decisions.",
    senior: "Test system design thinking, scalability considerations, security implications, and ability to identify technical debt. Expect the candidate to propose improvements and discuss long-term strategy.",
  };

  const prompt = `You are a technical interviewer for a **${role} engineering** position. You're interviewing a candidate about ${project.name}.

PROJECT CONTEXT:
${buildInterviewContext(project, role)}

DIFFICULTY LEVEL: ${difficulty}
${difficultyGuide[difficulty]}

PREVIOUS QUESTIONS ASKED (do NOT repeat these):
${previousQuestions.length > 0 ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'None yet'}

Focus areas for this role:
${roleFocus.map(f => `- ${f}`).join('\n')}

Ask ONE specific interview question about this project that tests ${role}-focused skills.
The question MUST reference actual project details (architecture, tech decisions, challenges).
Do NOT ask generic questions that could apply to any project.
Do NOT add preamble or commentary — just the question itself.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: interviewGenerationConfig,
      safetySettings,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text && text.trim() !== "" ? text.trim() : getFallbackInterviewQuestion(project, role, difficulty);
  } catch {
    return getFallbackInterviewQuestion(project, role, difficulty);
  }
}

export async function generateInterviewFeedback(
  project: ProjectTechnicalDetail,
  role: InterviewRole,
  difficulty: InterviewDifficulty,
  question: string,
  answer: string
): Promise<InterviewFeedback> {
  if (!apiKey) {
    return getFallbackFeedback();
  }

  const difficultyLabels = { junior: "Junior", mid: "Mid-Level", senior: "Senior" };

  const prompt = `You are a senior ${role} engineer providing interview feedback.

PROJECT: ${project.name} (${project.category}, ${project.status})
ROLE: ${role}
DIFFICULTY: ${difficultyLabels[difficulty]} level

QUESTION ASKED:
${question}

CANDIDATE'S ANSWER:
${answer}

PROJECT TECHNICAL DETAILS (for reference):
Architecture: ${project.architecture}
Key design decisions: ${project.designDecisions.map(d => d.decision).join(', ')}
Main challenges: ${project.challenges.map(c => c.problem).join(', ')}
Code quality gaps: ${project.codeQuality.notableGaps.join(', ')}

Evaluate this answer and return your response as a JSON object with these exact fields:
{
  "strengths": "What the candidate got right. Reference specific parts of their answer and explain why they're correct. Be specific.",
  "improvements": "What they missed, got wrong, or could have elaborated on. Explain WHY it matters for a ${role} role at ${difficultyLabels[difficulty]} level.",
  "framework": "3-5 bullet points of what a strong answer would cover. Keep it concise and actionable.",
  "rating": "Choose ONE: 🌱 Strong / 🌱 Good / 🌱 Needs Work / 🌱 Off Track for Junior, 🌿 Strong / 🌿 Good / 🌿 Needs Work / 🌿 Off Track for Mid, 🌳 Strong / 🌳 Good / 🌳 Needs Work / 🌳 Off Track for Senior. Match the difficulty icon prefix to the candidate's level.",
  "followUp": "A brief follow-up question or encouragement for the candidate. Only 1 sentence."
}

Return ONLY valid JSON. No markdown, no code fences, no additional text.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: feedbackGenerationConfig,
      safetySettings,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text || text.trim() === "") return getFallbackFeedback();

    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      strengths: parsed.strengths || "No specific strengths identified.",
      improvements: parsed.improvements || "Could not analyze improvements.",
      framework: parsed.framework || "Suggested answer not available.",
      rating: parsed.rating || "Rating not available.",
      followUp: parsed.followUp || "",
    };
  } catch {
    return getFallbackFeedback();
  }
}

export async function generateInterviewSummary(session: InterviewSession): Promise<string> {
  if (!apiKey || session.history.length === 0) {
    return `You answered ${session.history.length} questions in this session. Review the individual feedback above for each question.`;
  }

  const historyText = session.history
    .map((h, i) => `Q${i + 1}: ${h.question}\nA: ${h.answer}\nFeedback rating: ${(() => { try { return JSON.parse(h.feedback).rating; } catch { return 'N/A'; } })()}`)
    .join('\n\n');

  const prompt = `You are a senior engineering coach providing an end-of-session interview summary.

ROLE: ${session.role}
PROJECT: ${session.project.name}
DIFFICULTY: ${session.difficulty}
TOTAL QUESTIONS: ${session.history.length}

SESSION HISTORY:
${historyText}

Write a concise summary (2-3 paragraphs) that:
1. Overall assessment of the candidate's performance across all questions
2. Key strengths demonstrated
3. Areas that need the most improvement
4. Specific advice for interview preparation going forward

Keep it encouraging but honest. Be specific to the ${session.role} role.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: interviewGenerationConfig,
      safetySettings,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text && text.trim() !== "" ? text.trim() : "Session completed. Review individual question feedback above.";
  } catch {
    return "Session completed. Review individual question feedback above.";
  }
}

function buildInterviewContext(project: ProjectTechnicalDetail, role: InterviewRole): string {
  const focusAreas = project.interviewFocusAreas[role];
  return `
Name: ${project.name}
Category: ${project.category}
Status: ${project.status}
Stack: ${project.techStack.map(t => `${t.name}`).join(', ')}

Architecture: ${project.architecture}

Frontend: ${project.frontendDetails.stateManagement} | ${project.frontendDetails.stylingApproach}
Backend: ${project.backendDetails.apiDesign} | ${project.backendDetails.authStrategy}
Security: ${project.backendDetails.securityConsiderations.slice(0, 3).join('; ')}

Challenges: ${project.challenges.map(c => c.problem).join(' | ')}
Design Decisions: ${project.designDecisions.map(d => `${d.decision} (${d.rationale})`).join(' | ')}

Notable Gaps: ${project.codeQuality.notableGaps.slice(0, 3).join('; ')}
`.trim();
}

function getFallbackInterviewQuestion(project: ProjectTechnicalDetail, role: InterviewRole, difficulty: InterviewDifficulty): string {
  const questions: Record<string, string[]> = {
    frontend: [
      `Looking at ${project.name}'s frontend architecture (${project.frontendDetails.stateManagement}), what trade-offs were made in the state management approach, and how would you handle scaling it to support real-time features?`,
      `In ${project.name}, the styling uses ${project.frontendDetails.stylingApproach}. What are the pros and cons of this approach compared to CSS-in-JS alternatives?`,
      `The ${project.name} project has ${project.codeQuality.notableGaps.length > 0 ? `notable gaps like: ${project.codeQuality.notableGaps[0]}` : 'some areas for improvement'}. How would you address these from a frontend architecture perspective?`,
    ],
    backend: [
      `${project.name} uses ${project.backendDetails.authStrategy} for authentication. What are the security implications of this approach, and how would you improve it?`,
      `The database schema in ${project.name} is ${project.backendDetails.databaseSchema}. Discuss the schema design decisions and potential performance optimizations.`,
      `${project.name}'s API design is: ${project.backendDetails.apiDesign}. How would you refactor this to follow RESTful best practices and improve maintainability?`,
    ],
    fullstack: [
      `Discuss the end-to-end data flow in ${project.name}, from UI interaction to database persistence. What bottlenecks would you expect at scale?`,
      `${project.name} uses ${project.architecture}. What are the architectural trade-offs of this approach for a production application?`,
      `Looking at ${project.name}'s tech stack (${project.techStack.map(t => t.name).slice(0, 5).join(', ')}), what would you change if you were building this for 100x the current user base?`,
    ],
    software: [
      `${project.name} has the following code quality gaps: ${project.codeQuality.notableGaps.slice(0, 3).join(', ')}. Prioritize these and explain your approach to addressing them.`,
      `Describe how you would implement a testing strategy for ${project.name}, considering its architecture and tech stack. What would you test first and why?`,
      `${project.name} faced these challenges: ${project.challenges.map(c => c.problem).slice(0, 2).join(' and ')}. How would you have approached these differently?`,
    ],
  };

  const pool = questions[role] || questions.software;
  const idx = difficulty === 'junior' ? 0 : difficulty === 'mid' ? 1 : 2;
  return pool[Math.min(idx, pool.length - 1)];
}

function getFallbackFeedback(): InterviewFeedback {
  return {
    strengths: "The answer shows you've thought about the project's architecture and can discuss technical decisions.",
    improvements: "Consider going deeper into specific trade-offs and alternatives. A stronger answer would reference concrete examples from the project.",
    framework: "• Start with the core concept\n• Reference specific project details\n• Discuss trade-offs and alternatives\n• Conclude with your recommended approach",
    rating: "🌿 Good",
    followUp: "Want to try another question or dive deeper into this topic?",
  };
}

const deepDiveGenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
};

function buildDeepDiveFocusContext(focus: string): string {
  const focusGuides: Record<string, string> = {
    frontend: `FRONTEND FOCUS:
- Discuss component architecture, state management, rendering strategies
- Evaluate styling approaches, theming, accessibility
- Talk about build tooling, code splitting, bundle optimization
- Reference actual frontend code patterns used in projects`,
    backend: `BACKEND FOCUS:
- Discuss API design patterns, database schema decisions
- Evaluate authentication strategies, security considerations
- Talk about caching, rate limiting, error handling
- Reference actual backend architecture used in projects`,
    fullstack: `FULLSTACK FOCUS:
- Discuss end-to-end architecture, data flow, deployment
- Evaluate full-stack trade-offs, monorepo vs separate repos
- Talk about DevOps, CI/CD, environment configuration
- Reference how frontend and backend interact in projects`,
    software: `SOFTWARE ENGINEERING FOCUS:
- Discuss system design, testing strategies, code quality
- Evaluate technical debt management, refactoring priorities
- Talk about project planning, scalability considerations
- Reference code organization, patterns, and anti-patterns in projects`,
  };
  return focusGuides[focus] || focusGuides.software;
}

export async function generateDeepDiveResponse(
  userMessage: string,
  focus: string,
  projectContext: string
): Promise<string> {
  if (!apiKey) {
    return getFallbackDeepDiveResponse(userMessage, focus);
  }

  const focusContext = buildDeepDiveFocusContext(focus);

  const prompt = `You are a senior technical mentor providing deepdive insights about James Daniel's portfolio projects. Your role is to answer questions with real technical depth, referencing actual code, architecture decisions, and trade-offs from his projects.

${portfolioContext}

${focusContext}

PROJECT TECHNICAL CONTEXT (use this to provide specific, accurate answers):
${projectContext}

USER QUESTION: ${userMessage}

Instructions:
- Go deep — don't just describe, analyze and evaluate
- Reference specific project details, technologies, and architectural decisions
- Discuss trade-offs, alternatives, and what you'd improve
- If the question is about a specific technology or concept, relate it to how it's (or could be) used in these projects
- Be conversational but technically precise
- DO NOT make up information about the projects — only use what's provided in the context above
- If asked about something not covered in the project context, politely say you don't have that specific information
- Keep responses focused and thorough — aim for 2-4 paragraphs`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: deepDiveGenerationConfig,
      safetySettings,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text && text.trim() !== "" ? text.trim() : getFallbackDeepDiveResponse(userMessage, focus);
  } catch {
    return getFallbackDeepDiveResponse(userMessage, focus);
  }
}

function getFallbackDeepDiveResponse(userMessage: string, focus: string): string {
  const focusLabel = focus.charAt(0).toUpperCase() + focus.slice(1);
  return `That's a great **${focusLabel}** deep dive question! Unfortunately, I need my Gemini API connection to give you the most detailed technical answer.

Here's what I can tell you: James's portfolio includes various projects that demonstrate ${focus} engineering practices — from architecture decisions to implementation patterns. You can check the **Projects** page for an overview, or enable the Gemini API key in the \`.env\` file to unlock the full deep dive experience with code-level technical analysis.

Want to ask me something else in the meantime?`;
}

export interface MetricResult {
  text: string;
  latency_ms: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  model: string;
  confidence: number;
}

function buildFAQPrompt(userMessage: string, faqContext?: string): string {
  const contextPrompt = faqContext
    ? `\n\nKNOWN INFORMATION:\n${faqContext}\n\nUse this information to provide accurate responses. If the user asks about something covered above, reference it naturally.`
    : "";
  return `${portfolioContext}${contextPrompt}\n\nUSER QUESTION: ${userMessage}\n\nProvide a helpful, accurate response based on the context above. If the question is covered in the known information, use that. Otherwise, answer based on the general portfolio info.`;
}

export async function generateGeminiResponseWithMetrics(
  userMessage: string,
  faqContext?: string
): Promise<MetricResult> {
  if (!apiKey) {
    const text = getFallbackResponse(userMessage);
    return { text, latency_ms: 0, total_tokens: 0, prompt_tokens: 0, completion_tokens: 0, model: "fallback", confidence: 0.5 };
  }

  const start = performance.now();
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig, safetySettings });
    const prompt = buildFAQPrompt(userMessage, faqContext);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text()?.trim() || getFallbackResponse(userMessage);
    const latency_ms = Math.round(performance.now() - start);
    const usage = response.usageMetadata;

    const isFallback = text === getFallbackResponse(userMessage);

    return {
      text,
      latency_ms,
      total_tokens: usage?.totalTokenCount || 0,
      prompt_tokens: usage?.promptTokenCount || 0,
      completion_tokens: usage?.candidatesTokenCount || 0,
      model: "gemini-2.0-flash",
      confidence: isFallback ? 0.5 : 0.9,
    };
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    const latency_ms = Math.round(performance.now() - start);
    return {
      text: getFallbackResponse(userMessage),
      latency_ms,
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      model: "gemini-2.0-flash",
      confidence: 0.3,
    };
  }
}

export async function generateDeepDiveResponseWithMetrics(
  userMessage: string,
  focus: string,
  projectContext: string
): Promise<MetricResult> {
  if (!apiKey) {
    const text = getFallbackDeepDiveResponse(userMessage, focus);
    return { text, latency_ms: 0, total_tokens: 0, prompt_tokens: 0, completion_tokens: 0, model: "fallback", confidence: 0.5 };
  }

  const start = performance.now();
  try {
    const focusContext = buildDeepDiveFocusContext(focus);
    const prompt = `You are a senior technical mentor providing deepdive insights about James Daniel's portfolio projects. Your role is to answer questions with real technical depth, referencing actual code, architecture decisions, and trade-offs from his projects.\n\n${portfolioContext}\n\n${focusContext}\n\nPROJECT TECHNICAL CONTEXT (use this to provide specific, accurate answers):\n${projectContext}\n\nUSER QUESTION: ${userMessage}\n\nInstructions:\n- Go deep\n- Reference specific project details\n- Discuss trade-offs\n- Be conversational but precise\n- DO NOT make up information`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: deepDiveGenerationConfig,
      safetySettings,
    });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text()?.trim() || getFallbackDeepDiveResponse(userMessage, focus);
    const latency_ms = Math.round(performance.now() - start);
    const usage = response.usageMetadata;

    return {
      text,
      latency_ms,
      total_tokens: usage?.totalTokenCount || 0,
      prompt_tokens: usage?.promptTokenCount || 0,
      completion_tokens: usage?.candidatesTokenCount || 0,
      model: "gemini-2.0-flash",
      confidence: 0.9,
    };
  } catch (error: unknown) {
    console.error("Gemini API deep dive error:", error);
    const latency_ms = Math.round(performance.now() - start);
    return {
      text: getFallbackDeepDiveResponse(userMessage, focus),
      latency_ms,
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      model: "gemini-2.0-flash",
      confidence: 0.3,
    };
  }
}

export function isGeminiConfigured(): boolean {
  return !!apiKey && apiKey.length > 0;
}
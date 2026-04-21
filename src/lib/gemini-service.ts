import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI responses will be limited.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 512,
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

PROJECTS:
- SOLEASE: ITSM Platform with role-based access control, automated ticketing, real-time analytics
- Greatwall: Web3 energy protocol merging AI with blockchain for Kenya's power grid
- Franatech: Corporate website with modern responsive design

AVAILABILITY:
- Open to freelance projects, full-time opportunities, contract work
- Remote work friendly
- Hourly rate: $30-50

BEHAVIOR INSTRUCTIONS:
- If the question is about James or his services, answer from the portfolio info above
- If the question is a general conversation (greetings, thanks, goodbye, how are you, etc.), respond naturally and warmly
- If the question is about general tech topics (coding help, programming concepts, etc.), helpfully provide information
- If the question is completely unrelated to James or web development, acknowledge politely and gently redirect to portfolio topics
- Always be helpful, friendly, and professional
- Focus on what the customer wants to know
- Guide users toward taking action (contact, hire, explore projects)
- Keep responses concise but thorough based on the question
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

export function isGeminiConfigured(): boolean {
  return !!apiKey && apiKey.length > 0;
}
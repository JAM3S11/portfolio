import { getProjectByName, getRandomProject, ProjectTechnicalDetail } from "./project-knowledge";
import {
  generateInterviewQuestion,
  generateInterviewFeedback,
  generateInterviewSummary,
  isGeminiConfigured,
} from "./gemini-service";

export type InterviewRole = 'frontend' | 'backend' | 'fullstack' | 'software';
export type InterviewDifficulty = 'junior' | 'mid' | 'senior';

export interface QARecord {
  question: string;
  answer: string;
  feedback: string;
  timestamp: number;
}

export interface InterviewSession {
  role: InterviewRole;
  project: ProjectTechnicalDetail;
  difficulty: InterviewDifficulty;
  history: QARecord[];
  isActive: boolean;
  startedAt: number;
}

export interface InterviewFeedback {
  strengths: string;
  improvements: string;
  framework: string;
  rating: string;
  followUp: string;
}

const ROLE_LABELS: Record<InterviewRole, string> = {
  frontend: "Frontend Engineering",
  backend: "Backend Engineering",
  fullstack: "Fullstack Engineering",
  software: "Software Engineering",
};

const DIFFICULTY_LABELS: Record<InterviewDifficulty, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
};

export function getRoleLabel(role: InterviewRole): string {
  return ROLE_LABELS[role];
}

export function getDifficultyLabel(difficulty: InterviewDifficulty): string {
  return DIFFICULTY_LABELS[difficulty];
}

export function getRoleOptions(): { value: InterviewRole; label: string; icon: string }[] {
  return [
    { value: 'frontend', label: 'Frontend Engineering', icon: '🎯' },
    { value: 'backend', label: 'Backend Engineering', icon: '⚙️' },
    { value: 'fullstack', label: 'Fullstack Engineering', icon: '🔧' },
    { value: 'software', label: 'Software Engineering', icon: '🏗️' },
  ];
}

export function getDifficultyOptions(): { value: InterviewDifficulty; label: string; description: string }[] {
  return [
    { value: 'junior', label: '🌱 Junior', description: 'Fundamentals, basic concepts' },
    { value: 'mid', label: '🌿 Mid-Level', description: 'Trade-offs, architecture decisions' },
    { value: 'senior', label: '🌳 Senior', description: 'System design, scalability, strategy' },
  ];
}

export function createSession(
  role: InterviewRole,
  difficulty: InterviewDifficulty,
  projectName?: string
): InterviewSession {
  const project = projectName
    ? getProjectByName(projectName) || getRandomProject()
    : getRandomProject();

  return {
    role,
    project,
    difficulty,
    history: [],
    isActive: true,
    startedAt: Date.now(),
  };
}

export async function generateQuestion(session: InterviewSession): Promise<string> {
  const previousQuestions = session.history.map(h => h.question);
  return await generateInterviewQuestion(
    session.project,
    session.role,
    session.difficulty,
    previousQuestions
  );
}

export async function evaluateAnswer(
  session: InterviewSession,
  question: string,
  answer: string
): Promise<InterviewFeedback> {
  return await generateInterviewFeedback(
    session.project,
    session.role,
    session.difficulty,
    question,
    answer
  );
}

export async function getHint(
  session: InterviewSession,
  question: string
): Promise<string> {
  return `Here's a hint for that question: Think about how this relates to ${session.project.name}'s architecture and the specific trade-offs involved. Focus on the "${session.role}" perspective.`;
}

export async function getSummary(session: InterviewSession): Promise<string> {
  if (session.history.length === 0) {
    return "No questions were answered during this session.";
  }
  return await generateInterviewSummary(session);
}

export function buildProjectContext(session: InterviewSession): string {
  const p = session.project;
  const role = session.role;
  const focusAreas = p.interviewFocusAreas[role];

  return `
Project: ${p.name}
Category: ${p.category}
Status: ${p.status}
Architecture: ${p.architecture}

Key Design Decisions:
${p.designDecisions.map(d => `- ${d.decision}: ${d.rationale} (Trade-off: ${d.tradeoffs})`).join('\n')}

Challenges:
${p.challenges.map(c => `- ${c.problem} → ${c.solution}`).join('\n')}

Focus Areas for this role:
${focusAreas.map(f => `- ${f}`).join('\n')}

Tech Stack: ${p.techStack.map(t => `${t.name} (${t.purpose})`).join(', ')}
`.trim();
}

export function generateWelcomeMessage(role: InterviewRole): string {
  return `Let's practice for a **${getRoleLabel(role)}** interview! 🎯

I'll ask you technical questions about the projects in my portfolio, and you answer them like you would in a real interview. After each answer, I'll give you detailed feedback on what you did well and what you could improve.

First, which project should we focus on?`;
}

export function generateProjectSelectionMessage(projects: { name: string; category: string }[]): string {
  const lines = projects.map((p, i) => `${i + 1}. **${p.name}** (${p.category})`);
  return `Choose a project to practice with:\n\n${lines.join('\n')}\n\nOr click **🎲 Surprise Me** and I'll pick one!`;
}

export function generateDifficultyMessage(): string {
  return "What experience level should the questions target?";
}

export function generateQuestionStartMessage(session: InterviewSession): string {
  return `**${getRoleLabel(session.role)} Practice — ${session.project.name}** (${getDifficultyLabel(session.difficulty)} level)

Here's your first question:`;
}

export function generateNextQuestionPrompt(session: InterviewSession): string {
  const completed = session.history.length;
  return `**Question ${completed + 1}** — type your answer below, or say "hint" for a nudge.`;
}

export function generateEndMessage(session: InterviewSession): string {
  const count = session.history.length;
  return count === 0
    ? "No questions attempted. Want to try again?"
    : `You answered **${count} question${count > 1 ? 's' : ''}** in this session!\n\nHere's your overall assessment:`;
}

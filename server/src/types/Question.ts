import { Metatype } from "./Metatype.js";

export type QuestionCore = {
  title: string;
  question: string;
  answer: string;
  explanation: string;
  category: string;
  tags?: string[];
  options: Array<{
    id: string;        // stable key (e.g., “A”, “B”, UUID)
    text: string;      // what the user sees
  }>;
  difficulty?: "easy" | "medium" | "hard";

  scheduledYear: number;
  scheduledMonth: number;
  scheduledDay: number;
  scheduledDate: number;

  pointsCorrect: number;
  pointsIncorrect: number;
  pointsUnanswered?: number;
  timeLimitSeconds?: number;

  // workflow + ownership
  status: "draft" | "published" | "archived";
  creatorUid: string;
  lastEditorUid?: string;

  // stats (optional)
  totalAttempts?: number;
  totalCorrect?: number;
};

export type Question = Metatype & QuestionCore;

export type CreateQuestionDTO = Omit<
  QuestionCore,
  keyof Metatype | "scheduledDate" | "creatorUid" | "lastEditorUid" | "status" | "totalAttempts" | "totalCorrect"
>;
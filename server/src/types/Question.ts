import { z } from "zod";
import { Metatype } from "./Metatype.js";

const optionIdMessage = "Option id is required";
const optionTextMessage = "Option text is required";

export const questionOptionSchema = z.object({
  id: z.string().min(1, optionIdMessage),
  text: z.string().min(1, optionTextMessage),
});

export const questionCoreSchema = z.object({
  title: z.string().min(1, "Title is required"),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  explanation: z.string().min(1, "Explanation is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string().min(1)).optional(),
  options: z
    .array(questionOptionSchema)
    .min(2, "At least two options are required"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  scheduledYear: z.number().int().min(1970).max(9999),
  scheduledMonth: z.number().int().min(1).max(12),
  scheduledDay: z.number().int().min(1).max(31),
  scheduledDate: z.number().int(),
  pointsCorrect: z.number().finite(),
  pointsIncorrect: z.number().finite(),
  pointsUnanswered: z.number().finite().optional(),
  timeLimitSeconds: z.number().int().positive().optional(),
  status: z.enum(["draft", "published", "archived"]),
  creatorUid: z.string().min(1, "creatorUid is required"),
  lastEditorUid: z.string().min(1, "lastEditorUid is required").optional(),
  totalAttempts: z.number().int().nonnegative().optional(),
  totalCorrect: z.number().int().nonnegative().optional(),
});

const metatypeSchema = z.object({
  id: z.string().min(1, "id is required"),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const questionSchema = metatypeSchema.merge(questionCoreSchema);

export const createQuestionSchema = questionCoreSchema.omit({
  scheduledDate: true,
  creatorUid: true,
  lastEditorUid: true,
  status: true,
  totalAttempts: true,
  totalCorrect: true,
});

export type QuestionCore = z.infer<typeof questionCoreSchema>;
export type Question = Metatype & QuestionCore;
export type CreateQuestionDTO = z.infer<typeof createQuestionSchema>;

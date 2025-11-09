import {
  createQuestionSchema,
  CreateQuestionDTO,
  QuestionCore,
} from "../types/Question.js";

/**
 * Validates the raw payload for creating a question.
 */
export function validateCreateQuestionPayload(payload: unknown) {
  return createQuestionSchema.safeParse(payload);
}

/**
 * Computes the scheduledDate UTC timestamp from year, month, and day.
 */
export function computeScheduledDate(
  year: number,
  month: number,
  day: number
): number {
  return Date.UTC(year, month - 1, day);
}

/**
 * Builds a QuestionCore object from a DTO and user info.
 */
export function buildQuestionCore(
  dto: CreateQuestionDTO,
  userUid: string,
  lastEditorUid?: string
): QuestionCore {
  const scheduledDate = computeScheduledDate(
    dto.scheduledYear,
    dto.scheduledMonth,
    dto.scheduledDay
  );
  return {
    ...dto,
    creatorUid: userUid,
    scheduledDate,
    status: "published",
    totalAttempts: 0,
    totalCorrect: 0,
    lastEditorUid: lastEditorUid || userUid,
  };
}

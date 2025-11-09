import { createQuestionSchema } from "../types/Question.js";

/**
 * Validates the raw payload for creating a question.
 */
export function validateCreateQuestionPayload(payload: unknown) {
  return createQuestionSchema.safeParse(payload);
}

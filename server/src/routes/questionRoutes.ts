import { Router } from "express";
import {
  createQuestion,
  getQuestion,
  getDailyQuestion,
  listQuestions,
  deleteQuestion,
  updateQuestion,
  submitAnswer,
  getAnswerHistory
} from "../controllers/questionController.js";

export const questionRouter = Router();

// Define your question routes here
questionRouter.post("/", createQuestion);
questionRouter.get("/:questionId", getQuestion);
questionRouter.get("/:scheduledYear/:scheduledMonth/:scheduledDay",getDailyQuestion);
questionRouter.get("/", listQuestions);
questionRouter.delete("/:questionId", deleteQuestion);
questionRouter.put("/:questionId", updateQuestion);

questionRouter.post("/:questionId/submit-answer", submitAnswer);
questionRouter.patch("/userHistory/:userId", getAnswerHistory);

import { Router } from "express";
import { createQuestion, getQuestion, getDailyQuestion } from "../controllers/questionController.js";

export const questionRouter = Router();

// Define your question routes here
questionRouter.post("/", createQuestion);
questionRouter.get("/:questionId", getQuestion);
questionRouter.get("/:scheduledYear/:scheduledMonth/:scheduledDay", getDailyQuestion);
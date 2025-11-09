import { Router } from "express";
import { createQuestion, getQuestion, getDailyQuestion, listQuestions } from "../controllers/questionController.js";

export const questionRouter = Router();

// Define your question routes here
questionRouter.post("/", createQuestion);
questionRouter.get("/:questionId", getQuestion);
questionRouter.get("/:scheduledYear/:scheduledMonth/:scheduledDay", getDailyQuestion);
questionRouter.get("/", listQuestions);
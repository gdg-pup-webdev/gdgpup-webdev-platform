import { Router } from "express";
import { createQuestion, getQuestion } from "../controllers/questionController.js";

export const questionRouter = Router();

// Define your question routes here
questionRouter.post("/", createQuestion);
questionRouter.get("/:questionId", getQuestion);

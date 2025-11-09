import { Router } from "express";
import { createQuestion } from "../controllers/questionController.js";

export const questionRouter = Router();

// Define your question routes here
questionRouter.post("/", createQuestion);
import { RequestHandler } from "express";
import { ApiRequestBody } from "../types/ApiInterface.js";
import {
  CreateQuestionDTO,
  Question,
  QuestionCore,
} from "../types/Question.js";
import { db } from "../lib/firebase.js";
import { createApiResponse } from "../utils/apiRespones.js";
import { validateCreateQuestionPayload } from "../services/questionService.js";

// POST /questions
export const createQuestion: RequestHandler = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "No user found" });
  }
  const user = req.user;

  // STEP 1: retriving the createQuestionDTO
  const body = req.body as ApiRequestBody<CreateQuestionDTO>;

  if (!body) {
    return res
      .status(400)
      .json(createApiResponse(false, "Request body is required"));
  }

  const validationResult = validateCreateQuestionPayload(body.payload);

  if (!validationResult.success) {
    return res
      .status(400)
      .json(
        createApiResponse(
          false,
          "Invalid question payload",
          validationResult.error.flatten()
        )
      );
  }

  const createQuestionDTO = validationResult.data;

  const scheduledDate = Date.UTC(
    createQuestionDTO.scheduledYear,
    createQuestionDTO.scheduledMonth - 1,
    createQuestionDTO.scheduledDay
  );

  if (Number.isNaN(scheduledDate)) {
    return res
      .status(400)
      .json(createApiResponse(false, "Invalid scheduled date"));
  }

  // STEP 2: creating the core question object
  const questionCore: QuestionCore = {
    ...createQuestionDTO,
    creatorUid: user.uid,
    scheduledDate,
    status: "draft",
    totalAttempts: 0,
    totalCorrect: 0,
    lastEditorUid: user.uid,
  };

  // STEP 3: creating the question document
  try {
    const questionDoc = db.collection("questions").doc();
    const now = Date.now();

    const question: Question = {
      id: questionDoc.id,
      createdAt: now,
      updatedAt: now,
      ...questionCore,
    };

    // STEP 4: saving the question to the database
    await questionDoc.set(question);

    return res
      .status(201)
      .json(createApiResponse(true, "Question created", question));
  } catch (error) {
    console.error("Failed to create question", error);
    return res
      .status(500)
      .json(createApiResponse(false, "Failed to create question"));
  }
};

// return specific question 
// GET /questions/{questionId}
export const getQuestion: RequestHandler = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "No user found" });
  }

  const questionId = req.params.questionId;

  try {
    const questionDoc = db.collection("questions").doc(questionId);
    const questionSnapshot = await questionDoc.get();
    if (!questionSnapshot.exists) {
      return res
        .status(404)
        .json(createApiResponse(false, "Question not found"));
    }

    const question = questionSnapshot.data() as Question;

    return res
      .status(200)
      .json(createApiResponse(true, "Success", question));
  } catch (error) {
    console.error("Failed to get question", error);
    return res
      .status(500)
      .json(createApiResponse(false, "Failed to get question"));
  }
}
    

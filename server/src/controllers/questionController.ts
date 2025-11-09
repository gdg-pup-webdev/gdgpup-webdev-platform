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
  // Check for authenticated user
  if (!req.user) {
    return res.status(401).json({ error: "No user found" });
  }

  // Get questionId from params
  const questionId = req.params.questionId;

  try {
    // Get question from database
    const questionDoc = db.collection("questions").doc(questionId);
    const questionSnapshot = await questionDoc.get();
    if (!questionSnapshot.exists) {
      // Question not found
      return res
        .status(404)
        .json(createApiResponse(false, "Question not found"));
    }

    // Retrieve question data
    const question = questionSnapshot.data() as Question;
    // Return the found question
    return res.status(200).json(createApiResponse(true, "Success", question));
  } catch (error) {
    // Log the error
    console.error("Failed to get question", error);
    return res
      .status(500)
      .json(createApiResponse(false, "Failed to get question"));
  }
};

// return daily question based on scheduled date
// GET /questions/{scheduledYear}/{scheduledMonth}/{scheduledDay}
export const getDailyQuestion: RequestHandler = async (req, res) => {
  // Check for authenticated user
  if (!req.user) {
    return res.status(401).json({ error: "No user found" });
  }

  // Get scheduled date
  const scheduledYear = parseInt(req.params.scheduledYear, 10);
  const scheduledMonth = parseInt(req.params.scheduledMonth, 10);
  const scheduledDay = parseInt(req.params.scheduledDay, 10);

  // Validate scheduled date
  const scheduledDate = Date.UTC(
    scheduledYear,
    scheduledMonth - 1,
    scheduledDay
  );

  try {
    // Query for the question with the matching scheduledDate
    const questionsRef = db.collection("questions");
    const querySnapshot = await questionsRef
      .where("scheduledDate", "==", scheduledDate)
      .limit(1)
      .get();

    // Check if the query returned any results
    if (querySnapshot.empty) {
      return res
        .status(404)
        .json(createApiResponse(false, "Daily question not found"));
    }
    // Get the first question
    const question = querySnapshot.docs[0].data() as Question;

    // Return the found question
    return res.status(200).json(createApiResponse(true, "Success", question));
  } catch (error) {
    // Log the error
    console.error("Failed to get question", error);
    return res
      .status(500)
      .json(createApiResponse(false, "Failed to get question"));
  }
};

// return list of questions
// query parameters: limit, sortDirection, lastPageToken
export const listQuestions: RequestHandler = async (req, res) => {
  // Check for authenticated user
  if (!req.user) {
    return res.status(401).json({ error: "No user found" });
  }

  // Get query parameters
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const sortDirection = ((req.query.sortDirection as string) || "desc") as
    | "asc"
    | "desc";
  const lastPageToken = (req.query.lastPageToken as string) || null;

  // Build query
  let query = db
    .collection("questions")
    .orderBy("scheduledDate", sortDirection)
    .limit(limit);
  if (lastPageToken) {
    const lastDoc = await db.collection("questions").doc(lastPageToken).get();
    if (lastDoc.exists) {
      query = query.startAfter(lastDoc);
    }
  }

  // Execute query
  const snapshot = await query.get();
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Return response
  return res.status(200).json(createApiResponse(true, "Success", data));
};

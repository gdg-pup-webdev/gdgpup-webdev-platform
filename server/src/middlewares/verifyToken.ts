import { RequestHandler } from "express";
import { auth } from "../lib/firebase.js";
import { fetchUserFromDb } from "../services/userService.js";
import { createApiResponse } from "../utils/apiRespones.js";

export const verifyToken: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If no header, mark user as undefined and continue (optional)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = undefined;
    req.decodedToken = undefined;
    return next();
  }

  // Extract the token and user
  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);
    const user = await fetchUserFromDb(decoded.uid);
    req.user = user;
    req.decodedToken = decoded;
    return next();
  } catch (error) {
    req.user = undefined;
    req.decodedToken = undefined;
    return next();
  }
};

export const ensureUserExists: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(createApiResponse(false, "Unauthorized"));
  }
  next();
};

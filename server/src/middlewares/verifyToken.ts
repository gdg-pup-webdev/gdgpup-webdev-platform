import { RequestHandler } from "express";
import { auth } from "../lib/firebase.js";
import { fetchUserFromDb } from "../services/userService.js";

export const checkForToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no header, mark user as null and continue (optional)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = undefined;
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);
    const user = await fetchUserFromDb(decoded.uid);

    req.user = user;
    req.decodedToken = decoded;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    req.user = undefined;
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const ensureUserExists: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "No user found" });
  }
  next();
};

import { RequestHandler } from "express";
import { auth } from "../lib/firebase.js";

export const verifyToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔹 If no header, mark user as null and continue (optional)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];

    // 🔹 Verify the ID token
    const decoded = await auth.verifyIdToken(token);

    // 🔹 Fetch full user record
    const user = await auth.getUser(decoded.uid);

    // 🔹 Attach to request
    req.user = user;
    req.decodedToken = decoded;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    req.user = null;
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

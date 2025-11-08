import { RequestHandler } from "express";
import { auth } from "../lib/firebase.js";

export const restrictRoute = (allowedRoles: string[]) => {
  const middleware: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No user found" });
      }

      const user = req.user;
      const customClaims = user.customClaims;
      const role = customClaims?.role || "guest";

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      req.user = null;
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };

  return middleware;
};

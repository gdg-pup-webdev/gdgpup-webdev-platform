import { RequestHandler } from "express";
import { createApiResponse } from "../utils/apiRespones.js";

export const restrictRoute = (allowedRoles: string[]) => {
  const middleware: RequestHandler = async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createApiResponse(false, "Unauthorized"));
    }

    const user = req.user;
    const customClaims = user.customClaims;
    const role = customClaims?.role || "guest";

    if (!allowedRoles.includes(role)) {
      return res.status(403).json(createApiResponse(false, "Forbidden"));
    }

    return next();
  };

  return middleware;
};

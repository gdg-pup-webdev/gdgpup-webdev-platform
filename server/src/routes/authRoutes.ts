import { Router } from "express";
import { auth } from "../lib/firebase.js";
import { createApiResponse } from "../utils/apiRespones.js";

export const authRouter = Router();

authRouter.get("/custom-claims", async (req, res) => {
  if (!req.user) {
    return res.status(401).json(createApiResponse(false, "No user found"));
  }

  const user = req.user;

  let customClaims = user.customClaims;
  if (!customClaims || Object.keys(customClaims).length === 0) {
    const defaultClaims = { role: "user" };
    await auth.setCustomUserClaims(user.uid, defaultClaims);
    customClaims = defaultClaims;
  }

  res.json(createApiResponse(true, "Success", customClaims));
});

authRouter.get("/null-claims", async (req, res) => {
  if (!req.user) {
    return res.status(401).json(createApiResponse(false, "No user found"));
  }
  const user = req.user;

  await auth.setCustomUserClaims(user.uid, null);

  res.json(createApiResponse(true, "Success"));
});

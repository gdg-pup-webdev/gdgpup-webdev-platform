import { RequestHandler } from "express";
import { createApiResponse } from "../utils/apiRespones.js";
import { auth } from "../lib/firebase.js";
import { UserClaims } from "../types/UserClaims.js";

export const getUserCustomClaims: RequestHandler = async (req, res) => {
  const user = req.user!;
  const role = user.customClaims?.role || "guest";
  const uid = req.params.uid;

  // PERMISSIONS: 
  // Must be authenticated and accessing own claims, except for admins
  if (role !== "admin" && user.uid !== uid) {
    return res.status(403).json(createApiResponse(false, "Forbidden."));
  }

  // get claims. initiate if it doesnt exist
  let customClaims = user.customClaims as UserClaims;
  if (!customClaims || Object.keys(customClaims).length === 0) {
    const defaultClaims: UserClaims = { role: "user" };
    await auth.setCustomUserClaims(user.uid, defaultClaims);
    customClaims = defaultClaims;
  }

  // return claims
  return res.json(createApiResponse(true, "Success", customClaims));
};

export const nullifyUserCustomClaims: RequestHandler = async (req, res) => {
  const user = req.user!;
  const role = user.customClaims?.role || "guest";

  // PERMISSIONS: 
  // Must be an admin
  if (role !== "admin") {
    return res.status(403).json(createApiResponse(false, "Forbidden."));
  }

  await auth.setCustomUserClaims(user.uid, null);

  res.json(createApiResponse(true, "Success"));
};

import { RequestHandler } from "express";
import { createApiResponse } from "../utils/apiRespones.js";
import { auth } from "../lib/firebase.js";
import { fetchUserFromDb } from "../services/userService.js";

export const getUserCustomClaims: RequestHandler = async (req, res) => {
  const userId = req.params.uid;
  const user = await fetchUserFromDb(userId);

  if (!user) {
    return res.status(404).json(createApiResponse(false, "User not found"));
  }

  const callerUser = req.user!;

  // ensure the user is accessing his own claims or an admin user
  if (
    user.uid !== callerUser.uid &&
    callerUser.customClaims?.role !== "admin"
  ) {
    return res.status(403).json(createApiResponse(false, "You can only access your own claims. Except admins."));
  }

  // get claims. initiate it if it doesnt exist
  let customClaims = user.customClaims;
  if (!customClaims || Object.keys(customClaims).length === 0) {
    const defaultClaims = { role: "user" };
    await auth.setCustomUserClaims(user.uid, defaultClaims);
    customClaims = defaultClaims;
  }

  // return claims
  res.json(createApiResponse(true, "Success", customClaims));
};

export const nullifyUserCustomClaims: RequestHandler = async (req, res) => {
  const userId = req.params.uid;
  const user = await fetchUserFromDb(userId);

  if (!user) {
    return res.status(404).json(createApiResponse(false, "User not found"));
  }

  await auth.setCustomUserClaims(user.uid, null);

  res.json(createApiResponse(true, "Success"));
};

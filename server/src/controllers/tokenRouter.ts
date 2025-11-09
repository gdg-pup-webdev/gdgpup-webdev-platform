import { RequestHandler } from "express";
import { ApiRequestBody } from "../types/ApiInterface.js";
import { CreateTokenDTO, Token, TokenCore } from "../types/Token.js";
import { generateTokenCode } from "../utils/tokenUtil.js";
import { db } from "../lib/firebase.js";
import { createApiResponse } from "../utils/apiRespones.js";

export const createToken: RequestHandler = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "No user found" });
  }
  const user = req.user;

  // STEP 1: retriving the createTokenDTO
  const body = req.body as ApiRequestBody<CreateTokenDTO>;
  const createTokenDTO = body.payload;

  // create new token code
  let tokenCode = "";
  for (let i = 0; i < 10; i++) {
    tokenCode = generateTokenCode();
    // check if it already exists
    const doc = await db.collection("tokens").doc(tokenCode).get();
    if (!doc.exists) {
      // if it doesn't exist, break out of the loop
      break;
    }
  }

  // STEP 2: creating the core token object
  const tokenCore: TokenCore = {
    ...createTokenDTO,
    code: tokenCode,
    isValid: true,
    creatorUid: user.uid,
    claimants: [],
  };

  // STEP 3: creating the complete token object
  const token: Token = {
    id: tokenCode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...tokenCore,
  };

  // STEP 4: saving the token to the database
  await db.collection("tokens").doc(tokenCode).set(token);

  res.json(createApiResponse(true, "Success", token));
};

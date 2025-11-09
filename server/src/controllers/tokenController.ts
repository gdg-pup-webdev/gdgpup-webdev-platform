import { RequestHandler } from "express";
import { ApiRequestBody } from "../types/ApiInterface.js";
import { CreateTokenDTO, Token, TokenCore } from "../types/Token.js";
import { generateTokenCode } from "../utils/tokenUtil.js";
import { db } from "../lib/firebase.js";
import { createApiResponse } from "../utils/apiRespones.js";
import {
  fetchWalletFromDb,
  incrementWalletValue,
} from "../services/walletService.js";
import { fetchTokenFromDb } from "../services/tokenService.js";

export const createToken: RequestHandler = async (req, res) => {
  const user = req.user!;
  const role = user.customClaims?.role || "guest";

  // PERMISSIONS:
  // Must be an admin
  if (role !== "admin") {
    return res.status(403).json(createApiResponse(false, "Forbidden."));
  }

  // STEP 1: retriving the createTokenDTO
  const body = req.body as ApiRequestBody<CreateTokenDTO>;
  const createTokenDTO = body.payload;

  // create new token code
  let tokenCode = "";
  let codeGenerated = false;
  for (let i = 0; i < 10; i++) {
    tokenCode = generateTokenCode();
    // check if it already exists
    const doc = await db.collection("tokens").doc(tokenCode).get();
    if (!doc.exists) {
      // if it doesn't exist, break out of the loop
      codeGenerated = true;
      break;
    }
  }
  if (!codeGenerated) {
    return res
      .status(500)
      .json(createApiResponse(false, "Failed to generate token code"));
  }

  // STEP 2: creating the core token object
  const tokenCore: TokenCore = {
    ...createTokenDTO,
    code: tokenCode,
    isValid: true,
    createdBy: user.uid,
    claimHistory: [],
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

export const getToken: RequestHandler = async (req, res) => {
  const tokenId = req.params.tokenId;

  const token = await fetchTokenFromDb(tokenId);

  if (!token) {
    return res.status(404).json(createApiResponse(false, "Token not found"));
  }

  res.json(createApiResponse(true, "Success", token));
};

export const listTokens: RequestHandler = async (req, res) => {
  const user = req.user!;
  const role = user.customClaims?.role || "guest";

  // PERMISSIONS:
  // Must be an admin
  if (role !== "admin") {
    return res.status(403).json(createApiResponse(false, "Forbidden."));
  }

  const limit = parseInt(req.query.limit as string) || 10;
  const sortDirection = ((req.query.sortDirection as string) || "desc") as
    | "asc"
    | "desc";
  const lastPageToken = (req.query.lastPageToken as string) || null;

  let query = db
    .collection("tokens")
    .orderBy("createdAt", sortDirection)
    .limit(limit);

  if (lastPageToken) {
    const lastDoc = await db.collection("tokens").doc(lastPageToken).get();
    if (lastDoc.exists) {
      query = query.startAfter(lastDoc);
    }
  }

  const snapshot = await query.get();
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.json(
    createApiResponse(true, "Success", {
      result: data,
      lastPageToken: data[data.length - 1]?.id || null,
    })
  );
};

export const voidToken: RequestHandler = async (req, res) => {
  const user = req.user!;
  const role = user.customClaims?.role || "guest";

  // PERMISSIONS:
  // Must be an admin
  if (role !== "admin") {
    return res.status(403).json(createApiResponse(false, "Forbidden."));
  }

  const tokenId = req.params.tokenId;

  // check if token exists
  const doc = await db.collection("tokens").doc(tokenId).get();

  if (!doc.exists) {
    return res.status(404).json(createApiResponse(false, "Token not found"));
  }

  const token = doc.data() as Token;

  // check if token is already voided
  if (!token.isValid) {
    return res
      .status(400)
      .json(createApiResponse(true, "Token is already voided", token));
  }

  // void the token
  const update = {
    isValid: false,
    updatedAt: Date.now(),
  };
  const voidedToken: Token = {
    ...token,
    ...update,
  };
  await db.collection("tokens").doc(tokenId).update(update);

  res.json(createApiResponse(true, "Token voided successfully", voidedToken));
};

export const claimToken: RequestHandler = async (req, res) => {
  const user = req.user;

  // PERMISSIONS:
  // Must be authenticated
  if (!user) {
    return res.status(403).json(createApiResponse(false, "Unauthorized."));
  }

  // get user wallet

  const uid = user?.uid;
  const wallet = await fetchWalletFromDb(uid);

  // get token
  const tokenId = req.params.tokenId;
  const token = await fetchTokenFromDb(tokenId);
  if (!token) {
    return res.status(404).json(createApiResponse(false, "Token not found"));
  }

  // check if token is valid
  if (!token.isValid) {
    return res.status(400).json(createApiResponse(false, "Token is invalid"));
  }

  // check if user has already claimed the token
  if (token.claimHistory.some((history) => history.uid === uid)) {
    return res
      .status(400)
      .json(createApiResponse(false, "User has already claimed the token"));
  }

  // add user to token claimants
  token.claimHistory.push({ uid: uid, date: Date.now() });
  await db
    .collection("tokens")
    .doc(tokenId)
    .update({ claimants: token.claimHistory });

  // increment user walletpoints
  const newWallet = await incrementWalletValue(wallet, token.value);

  // return new wallet data and new token data
  res.json(
    createApiResponse(true, "Success", { newWallet: newWallet, token: token })
  );
};

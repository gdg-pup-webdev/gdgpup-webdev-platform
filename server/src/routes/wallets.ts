import { Router } from "express";
import { createApiResponse } from "../utils/apiRespones.js";
import { Wallet } from "../types/Wallet.js";
import { auth, db } from "../lib/firebase.js";
import { isUserExists } from "../utils/firebaseUtils.js";

export const walletsRouter = Router();

walletsRouter.get("/:uid", async (req, res) => {
  const uid = req.params.uid;

  // check if user exists using firebase auth
  if (!await isUserExists(uid)) {
    res.status(404).json(createApiResponse(false, "User not found"));
    return;
  }

  // check if wallet exists
  const doc = await db.collection("wallets").doc(uid).get();

  // if wallet doesnt exist, initiate one with 0 points
  if (!doc.exists) {
    const defaultWallet: Wallet = {
      id: uid,
      points: 0,
    };
    await db.collection("wallets").doc(uid).set(defaultWallet);

    res.json(createApiResponse(true, "New wallet created", defaultWallet));
    return;
  }

  res.json(createApiResponse(true, "Success", doc.data()));
});

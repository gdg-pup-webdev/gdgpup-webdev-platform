import { Router } from "express";
import { createApiResponse } from "../utils/apiRespones.js";
import { Wallet } from "../types/Wallet.js";
import { auth, db } from "../lib/firebase.js";
import { isUserExists } from "../utils/firebaseUtils.js";

export const walletsRouter = Router();

walletsRouter.get("/:uid", async (req, res) => {
  const uid = req.params.uid;

  // check if user exists using firebase auth
  if (!(await isUserExists(uid))) {
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

walletsRouter.patch("/:uid/increment", async (req, res) => {
  const uid = req.params.uid;

  const body = req.body;
  const payload: { increment: number } = body.payload;

  // check if wallet exists
  const doc = await db.collection("wallets").doc(uid).get();

  if (!doc.exists) {
    res.status(404).json(createApiResponse(false, "Wallet not found"));
    return;
  }

  const wallet = doc.data() as Wallet;
  const newPoints = wallet.points + payload.increment;

  await db.collection("wallets").doc(uid).update({ points: newPoints });

  res.json(createApiResponse(true, "Success", { points: newPoints }));
});

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

walletsRouter.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const sortDirection = ((req.query.sortDirection as string) || "desc") as
      | "asc"
      | "desc";
    const lastPageToken = (req.query.lastPageToken as string) || null;

    let query = db
      .collection("wallets")
      .orderBy("points", sortDirection)
      .limit(limit);

    if (lastPageToken) {
      const lastDoc = await db.collection("wallets").doc(lastPageToken).get();
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
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ success: false, message: "Failed to fetch blogs" });
  }
});

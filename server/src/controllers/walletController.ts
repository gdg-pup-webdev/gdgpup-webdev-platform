import { RequestHandler } from "express";
import { db } from "../lib/firebase.js";
import { Wallet } from "../types/Wallet.js";
import { createApiResponse } from "../utils/apiRespones.js";
import { isUserExists } from "../utils/firebaseUtils.js";
import { randomUUID } from "crypto";
import { JournalEntry } from "../types/Journal.js";
import {
  fetchWalletFromDb,
  incrementWalletValue,
} from "../services/walletService.js";

export const getWalletAction: RequestHandler = async (req, res) => {
  const uid = req.params.uid;

  // check if user exists using firebase auth
  if (!(await isUserExists(uid))) {
    res.status(404).json(createApiResponse(false, "User not found"));
    return;
  }

  // use wallet service to get user wallet
  const wallet = await fetchWalletFromDb(uid);

  res.json(createApiResponse(true, "Success", wallet));
};

export const incrementWalletPoints: RequestHandler = async (req, res) => {
  const uid = req.params.uid;

  const body = req.body;
  const payload: { increment: number } = body.payload;

  const wallet = await fetchWalletFromDb(uid);
  if (!wallet) {
    res.status(404).json(createApiResponse(false, "Wallet not found"));
    return;
  }

  const newWallet = await incrementWalletValue(wallet, payload.increment, uid);

  res.json(createApiResponse(true, "Success", { newWallet: newWallet }));
};

export const listWallets: RequestHandler = async (req, res) => {
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
};

export const listWalletHistory: RequestHandler = async (req, res) => {
  try {
    console.log("hello worldd");
    const uid = req.params.uid;

    const limit = parseInt(req.query.limit as string) || 10;
    const sortDirection = ((req.query.sortDirection as string) || "desc") as
      | "asc"
      | "desc";
    const lastPageToken = (req.query.lastPageToken as string) || null;

    let query = db
      .collection("wallets")
      .doc(uid)
      .collection("history")
      .orderBy("createdAt", sortDirection)
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
};

export const getWalletHistoryEntry: RequestHandler = async (req, res) => {
  const uid = req.params.uid;
  const entryId = req.params.entryId;

  // check if entry exists
  const doc = await db
    .collection("wallets")
    .doc(uid)
    .collection("history")
    .doc(entryId)
    .get();

  // if wallet doesnt exist, initiate one with 0 points
  if (!doc.exists) {
    res.status(404).json(createApiResponse(false, "Entry not found"));
    return;
  }

  res.json(createApiResponse(true, "Success", doc.data()));
};

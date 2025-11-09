import { RequestHandler } from "express";
import { db } from "../lib/firebase.js";
import { Wallet } from "../types/Wallet.js";
import { createApiResponse } from "../utils/apiRespones.js";
import { isUserValid } from "../utils/firebaseUtils.js";
import { randomUUID } from "crypto";
import { JournalEntry } from "../types/Journal.js";
import { 
  fetchWalletFromDb,
  incrementWalletValue,
} from "../services/walletService.js";
import { fetchUserFromDb } from "../services/userService.js";

export const getWallet: RequestHandler = async (req, res) => {
  const uid = req.params.uid;

  // check if user exists
  const user = await fetchUserFromDb(uid);
  if (!user) {
    res.status(404).json(createApiResponse(false, "User not found"));
    return;
  }

  // use wallet service to get user wallet
  const wallet = await fetchWalletFromDb(uid);

  // returning the response
  res.json(createApiResponse(true, "Success", wallet));
};

export const incrementWalletPoints: RequestHandler = async (req, res) => {
  const senderUser=  req.user;
  if (!senderUser) {
    res.status(401).json(createApiResponse(false, "unauthenticated"));
    return;
  }


  const uid = req.params.uid;
  const payload: { increment: number } = req.body.payload;
  const increment = payload.increment;

  // check if user exists
  const user = await fetchUserFromDb(uid);
  if (!user) {
    res.status(404).json(createApiResponse(false, "User not found"));
    return;
  }

  // only owner user & admin can increment wallet points
  if (user.uid !== senderUser.uid && senderUser.customClaims?.role !== "admin") {
    res.status(403).json(createApiResponse(false, "Unauthorized"));
    return;
  }


  // get the wallet and increment it
  const wallet = await fetchWalletFromDb(uid);
  const newWallet = await incrementWalletValue(wallet, increment, uid);

  // returning the response
  res.json(createApiResponse(true, "Success", { newWallet: newWallet }));
};

export const listWallets: RequestHandler = async (req, res) => {
  try {
    // get query parameters for filtering and pagination
    const limit = parseInt(req.query.limit as string) || 10;
    const sortDirection = ((req.query.sortDirection as string) || "desc") as
      | "asc"
      | "desc";
    const lastPageToken = (req.query.lastPageToken as string) || null;

   // building the query
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

  // executing the query
  const snapshot = await query.get();
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

    // returning the response
    res.json(
      createApiResponse(true, "Success", {
        result:data,
        lastPageToken:  data[data.length - 1]?.id || null,
      })
    );
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ success: false, message: "Failed to fetch blogs" });
  }
};

export const listWalletHistory: RequestHandler = async (req, res) => {
  try {
    const uid = req.params.uid;

    // check if user exists
    const user = await fetchUserFromDb(uid);
    if (!user) {
      res.status(404).json(createApiResponse(false, "User not found"));
      return;
    }

    // get query parameters for filtering and pagination
    const limit = parseInt(req.query.limit as string) || 10;
    const sortDirection = ((req.query.sortDirection as string) || "desc") as
      | "asc"
      | "desc";
    const lastPageToken = (req.query.lastPageToken as string) || null;

    // building the query
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

    // executing the query
    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // returning the response
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

  // check if user exists
  const user = await fetchUserFromDb(uid);
  if (!user) {
    res.status(404).json(createApiResponse(false, "User not found"));
    return;
  }

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

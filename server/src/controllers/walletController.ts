import { RequestHandler } from "express";
import { db } from "../lib/firebase.js";
import { createApiResponse } from "../utils/apiRespones.js";
import {
  createNewWalletOnDb,
  fetchWalletFromDb,
  incrementWalletValue,
} from "../services/walletService.js";
import { fetchUserFromDb } from "../services/userService.js";
import { ApiRequestBody } from "../types/ApiInterface.js";
import { WalletDuplicate, WalletList } from "../types/Wallet.js";

export const getWallet: RequestHandler = async (req, res) => {
  const uid = req.params.uid;

  // check if user exists
  const user = await fetchUserFromDb(uid);
  if (!user) {
    res.status(404).json(createApiResponse(false, "User not found"));
    return;
  }

  // use wallet service to get user wallet
  let wallet = await fetchWalletFromDb(uid);

  // if wallet doesnt exist, initiate one with 0 points
  if (!wallet) {
    wallet = await createNewWalletOnDb(uid);
  }

  // returning the response
  res.json(createApiResponse(true, "Success", wallet));
};

export const incrementWalletPoints: RequestHandler = async (req, res) => {
  const user = req.user!;
  const role = user.customClaims?.role || "guest";
  const uid = req.params.uid;

  // PERMISSIONS:
  // Must be authenticated and accessing own claims, except for admins
  if (role !== "admin" && user.uid !== uid) {
    return res.status(403).json(createApiResponse(false, "Forbidden."));
  }

  const requestBody = req.body as ApiRequestBody<{ amount: number }>;
  const amount = requestBody.payload.amount;

  // get the wallet and increment it
  let wallet = await fetchWalletFromDb(uid);

  // if wallet doesnt exist, initiate one with 0 points
  if (!wallet) {
    wallet = await createNewWalletOnDb(uid);
  }

  const newWallet = await incrementWalletValue(wallet, amount);

  // returning the response
  res.json(createApiResponse(true, "Success", newWallet));
};

export const listWallets: RequestHandler = async (req, res) => {
  // get sort direction (asc or desc)
  const sortDirection = ((req.query.sortDirection as string) || "desc") as
    | "asc"
    | "desc";

  // fetch the WalletList document
  const walletListDoc = await db.collection("wallets").doc("list").get();
  let walletList: WalletList = {};
  if (walletListDoc.exists) {
    walletList = walletListDoc.data() as WalletList;
  }

  // convert Record<string, WalletDuplicate> to array
  let walletsArray = Object.values(walletList);

  // sort by points
  walletsArray.sort((a, b) => {
    if (sortDirection === "asc") return a.points - b.points;
    return b.points - a.points;
  });

  res.json(createApiResponse(true, "Success", walletsArray));
};

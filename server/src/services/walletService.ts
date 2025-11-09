import { randomUUID } from "crypto";
import { db } from "../lib/firebase.js";
import { Wallet } from "../types/Wallet.js";
import { createApiResponse } from "../utils/apiRespones.js";
import { isUserExists } from "../utils/firebaseUtils.js";
import { JournalEntry } from "../types/Journal.js";

export const fetchWalletFromDb = async (
  uid: string
): Promise<Wallet | undefined> => {
  // check if wallet exists
  const doc = await db.collection("wallets").doc(uid).get();

  // if wallet doesnt exist, initiate one with 0 points
  if (!doc.exists) {

    const defaultWallet: Wallet = {
      id: uid,
      points: 0,
    };
    await db.collection("wallets").doc(uid).set(defaultWallet);

    return defaultWallet;
  }

  return doc.data() as Wallet;
};

export const incrementWalletValue = async (
  wallet: Wallet,
  increment: number,
  uid: string
) => {
  const newPoints = wallet.points + increment;
  const newWallet = { ...wallet, points: newPoints };

  await db.collection("wallets").doc(wallet.id).update({ points: newPoints });

  // create history journal entry
  const entryId = randomUUID();
  const entry: JournalEntry = {
    id: entryId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    actors: [{ uid, role: "user" }],
    title: "Incremented points",
    content: `You have incremented your points by ${increment}`,
  };
  await db
    .collection("wallets")
    .doc(uid)
    .collection("history")
    .doc(entryId)
    .set(entry);

  return newWallet;
};

import { randomUUID } from "crypto";
import { db } from "../lib/firebase.js";
import { Wallet } from "../types/Wallet.js";
import { createApiResponse } from "../utils/apiRespones.js";
import { isUserValid } from "../utils/firebaseUtils.js";
import { JournalEntry } from "../types/Journal.js";

/**
 * Fetch the wallet of a user from the database.
 * If the wallet does not exist, a new wallet with 0 points will be created.
 *
 * @param {string} uid - UID of the wallet owner. Assumes the user exists.
 * @returns {Promise<Wallet>} A Promise that resolves to the user's wallet. If no wallet existed, the returned wallet will be newly created with 0 points.
 */
export const fetchWalletFromDb = async (uid: string): Promise<Wallet> => {
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

/**
 * Increment the points of a user's wallet and create a history journal entry.
 *
 * This function updates the wallet's points in the database,
 * and logs the increment operation as a journal entry in the wallet's history subcollection.
 *
 * @param {Wallet} wallet - The wallet object to update. Must include the current points and id.
 * @param {number} increment - The number of points to add to the wallet.
 * @param {string} uid - The UID of the actor performing the increment. Used for the journal entry.
 * @returns {Promise<Wallet>} A Promise that resolves to the updated wallet object with the new points value.
 *
 * @example
 * const updatedWallet = await incrementWalletValue(wallet, 50, userUid);
 * console.log(updatedWallet.points); // original points + 50
 */
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

import { randomUUID } from "crypto";
import { db } from "../lib/firebase.js";
import { Wallet, WalletDuplicate, WalletList } from "../types/Wallet.js";

/**
 * Fetch the wallet of a user from the database.
 * If the wallet does not exist, a new wallet with 0 points will be created.
 *
 * @param {string} uid - UID of the wallet owner. Assumes the user exists.
 * @returns {Promise<Wallet>} A Promise that resolves to the user's wallet. If no wallet existed, the returned wallet will be newly created with 0 points.
 */
export const fetchWalletFromDb = async (uid: string): Promise<Wallet> => {
  const doc = await db.collection("wallets").doc(uid).get();

  if (!doc.exists) {
    const newWallet = await createNewWalletOnDb(uid);
    return newWallet;
  }

  return doc.data() as Wallet;
};

export const createNewWalletOnDb = async (uid: string) => {
  // create new wallet
  const defaultWallet: Wallet = {
    id: uid,
    points: 0,
    uid: uid,
    history: [],
  };

  // post new wallet on database
  await db.collection("wallets").doc(uid).set(defaultWallet);

  // update wallet list
  await updateWalletList(defaultWallet);

  return defaultWallet;
};

export const updateWalletList = async (
  updatedWallet: Wallet
): Promise<WalletList> => {
  // build the wallet duplicate
  const walletDuplicate: WalletDuplicate = {
    id: updatedWallet.id,
    points: updatedWallet.points,
    uid: updatedWallet.uid,
  };

  // get complete list of wallets
  const listDoc = await db.collection("wallets").doc("list").get();
  let walletList = {} as WalletList;
  if (listDoc.exists) {
    walletList = listDoc.data() as WalletList;
  }

  // add new wallet to list
  walletList[walletDuplicate.uid] = walletDuplicate;

  // post on database
  await db.collection("wallets").doc("list").set(walletList);

  return walletList;
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
  message ?: string 
): Promise<Wallet> => {
  // create the updated wallet
  const newPoints = wallet.points + increment;
  const newWallet = {
    ...wallet,
    points: newPoints,
    history: [
      ...wallet.history,
      {
        change: increment,
        date: Date.now(),
        message: message || `Added ${increment} points`,
      },
    ],
  };

  // post changes on the database
  await db.collection("wallets").doc(wallet.id).update(newWallet);

  // update wallet list
  await updateWalletList(newWallet);

  // return the updated wallet
  return newWallet;
};

import { auth } from "../lib/firebase.js";

export async function fetchUserFromDb(uid: string) {
  try {
    const userRecord = await auth.getUser(uid); 
    return userRecord;
  } catch (error: unknown) {
    return undefined;
  }
}

import { Router } from "express";
import { auth } from "../lib/firebase.js";

export const userRouter = Router();

userRouter.get("/", async (req, res) => {
  let user = req.user;
  if (!user) {
    return res.status(401).json({
      errors: [
        {
          status: 401,
          title: "Unauthorized",
          detail: "You must be logged in to access this resource.",
        },
      ],
    });
  }

  // get the claims of the user
  const customClaims = user.customClaims;

  // create the claims if it doesnt exist
  if (!customClaims || Object.keys(customClaims).length === 0) {
    const defaultClaims = { role: "user" };
    await auth.setCustomUserClaims(user.uid, defaultClaims);
    user = await auth.getUser(user.uid);
  }

  return res.status(200).json({
    data: {
      type: "users",
      attributes: {
        displayName: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        uid: user.uid,
        role: customClaims?.role || "guest",
      },
    },
  });
});

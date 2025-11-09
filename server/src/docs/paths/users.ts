import { makeSwaggerPath, makeBasicResponses } from "../swaggerUtils.js";

export const usersPaths = {
  "/users/{uid}/custom-claims": makeSwaggerPath({
    method: "get",
    summary: "Get user’s custom-claims",
    description:
      "Retrieves a Firebase user's custom authentication claims. Only the user or an admin can access this endpoint.",
    tag: "Users",
    pathParams: [
      {
        name: "uid",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Firebase user ID",
      },
      {
        name: "place",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "Firebase user ID",
      },
    ],
    responses: makeBasicResponses({
      successExample: { role: "user", subscription: "premium" },
      notFoundMessage: "User not found",
    }),
  }),

  "/users/{uid}/null-custom-claims": makeSwaggerPath({
    method: "get",
    summary: "Nullify a user's custom Firebase Authentication claims",
    description: "Removes all custom claims assigned to a Firebase user.",
    tag: "Users",
    pathParams: [
      {
        name: "uid",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Firebase user ID",
      },
    ],
    responses: makeBasicResponses({
      successExample: null,
      notFoundMessage: "User not found",
    }),
  }),
};

import { makeParam } from "../swaggerUtils.js";


export const usersPaths = {
    "/users/{uid}/custom-claims": {
    "get": {
      "summary": "Get user’s custom-claims",
      "description": "Retrieves a Firebase user's custom authentication claims. Only the user themself or an admin can access this endpoint.",
      "tags": ["Users"],
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [ 
        makeParam("uid", "path", true, "Firebase user ID"),
      ],
      "responses": {
        "200": {
          "description": "Successfully retrieved custom claims.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Success"
                  },
                  "data": {
                    "type": "object",
                    "example": {
                      "role": "user",
                      "subscription": "premium"
                    }
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "User not found",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "message": {
                    "type": "string",
                    "example": "User not found"
                  }
                }
              }
            }
          }
        },
        "403": {
          "description": "Permission denied. You can only access your own claims unless you are an admin.",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "message": {
                    "type": "string",
                    "example": "Access denied"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  
  
  
  "/users/{uid}/null-custom-claims": {
    get: {
      summary: "Nullify a user's custom Firebase Authentication claims",
      description: "Removes all custom claims assigned to a Firebase user.",
      tags: ["Users"],
      parameters: [
        {
          name: "uid",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Firebase user ID",
        },
      ],
      responses: {
        "200": {
          description: "Custom claims removed successfully.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Success" },
                  data: { type: "null", example: null },
                },
              },
            },
          },
        },
        "404": { description: "User not found" },
        "403": { description: "Access denied" },
      },
    },
  },

 
};

import { usersPaths } from "./paths/users.js";

// src/swagger/swaggerDoc.ts
export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "GDG Webdev Platform API",
    version: "1.0.0",
    description: "API documentation for the GDG Webdev Platform",
  },
  servers: [
    {
      url: "http://localhost:8000/api",
      description: "Development server",
    },
  ],
  paths: {
   ...usersPaths,
  },
};

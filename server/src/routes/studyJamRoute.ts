import { Router } from "express";
import { postStudyJamBodySchema } from "../models/studyJam.js";
import { supabase } from "../lib/supabase.js";

export const studyJamRouter = Router();

studyJamRouter.post("/", async (req, res) => {
  const user = req.user;
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

  const role = user.customClaims?.role || "guest";
  if (role !== "admin") {
    return res.status(403).json({
      errors: [
        {
          status: 403,
          title: "Forbidden",
          detail: "You do not have permission to access this resource.",
        },
      ],
    });
  }

  const body = req.body;
  if (!body) {
    return res.status(400).json({
      errors: [
        {
          status: 400,
          title: "Bad Request",
          detail: "Request body is required.",
        },
      ],
    });
  }

  const parse = postStudyJamBodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      errors: parse.error.issues.map((err) => ({
        status: 400,
        title: "Validation Error",
        detail: err.message,
        source: { pointer: err.path.join("/") },
      })),
    });
  }

  const parsedData = parse.data;

  const { data, error } = await supabase
    .from("studyJams")
    .insert([parsedData.data.attributes])
    .select()
    .single();

  if (error)
    return res.status(400).json({
      errors: [
        {
          status: 400,
          title: "Bad Request",
          detail: error.message,
        },
      ],
    });

  return res.json({
    data: {
      ...parsedData.data,
      id: data.id,
    },
  });
});

studyJamRouter.get("/:id", async (req, res) => {
  const user = req.user;
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

  const role = user.customClaims?.role || "guest";
  if (role !== "admin") {
    return res.status(403).json({
      errors: [
        {
          status: 403,
          title: "Forbidden",
          detail: "You do not have permission to access this resource.",
        },
      ],
    });
  }

  const id = req.params.id;

  const { data, error } = await supabase
    .from("studyJams")
    .select()
    .eq("id", id)
    .single();

  if (error)
    return res.status(400).json({
      errors: [
        {
          status: 400,
          title: "Bad Request",
          detail: error.message,
        },
      ],
    });

  return res.json({
    data: {
      type: "studyJams",
      attributes: data,
      id: data.id,
    },
  });
});

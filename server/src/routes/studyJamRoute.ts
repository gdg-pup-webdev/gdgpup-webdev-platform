import { Router } from "express";
import {
  patchStudyJamBodySchema,
  postStudyJamBodySchema,
} from "../models/studyJam.js";
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
  // --- 1. Security Check (NONE - PUBLIC) ---

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

/**
 * GET /api/study-jams/ - Paginated list of Study Jams
 */
studyJamRouter.get("/", async (req, res) => {
  // --- 1. Security Check (NONE - PUBLIC) ---

  // --- 2. Pagination & Sorting Setup ---
  // Default values
  const DEFAULT_PAGE_SIZE = 10;
  const DEFAULT_PAGE_NUMBER = 1;
  const DEFAULT_SORT = "-created_at"; // Descending by created_at

  // Extract pagination parameters from JSON:API standard query params
  const pageSize =
    parseInt(req.query["page[size]"] as string) || DEFAULT_PAGE_SIZE;
  const pageNumber =
    parseInt(req.query["page[number]"] as string) || DEFAULT_PAGE_NUMBER;
  const sortParam = (req.query.sort as string) || DEFAULT_SORT;

  // Calculate Supabase range (0-indexed)
  const from = (pageNumber - 1) * pageSize;
  const to = from + pageSize - 1;

  // Determine sort order
  const isAscending = !sortParam.startsWith("-");
  const sortColumn = isAscending ? sortParam : sortParam.substring(1);

  // --- 3. Supabase Query ---
  try {
    const {
      data: records,
      count: totalCount,
      error,
    } = await supabase
      .from("studyJams")
      // Select all columns and request the total count
      .select(`*`, { head: false, count: "exact" })
      // Apply sorting
      .order(sortColumn, { ascending: isAscending })
      // Apply pagination range
      .range(from, to);

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({
        errors: [
          { status: 500, title: "Database Error", detail: error.message },
        ],
      });
    }

    // --- 4. Format JSON:API Response ---
    const totalPages = Math.ceil(totalCount! / pageSize);
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    // Helper to generate the pagination URL
    const generateUrl = (page: number) => {
      if (page < 1 || page > totalPages) return null;
      return `${baseUrl}?page[number]=${page}&page[size]=${pageSize}&sort=${sortParam}`;
    };

    return res.json({
      // The Data Array (JSON:API format)
      data: records.map((record) => ({
        type: "studyJams",
        id: record.id,
        attributes: record,
      })),

      // The Links Object for Navigation
      links: {
        self: generateUrl(pageNumber),
        first: generateUrl(1),
        prev: pageNumber > 1 ? generateUrl(pageNumber - 1) : null,
        next: pageNumber < totalPages ? generateUrl(pageNumber + 1) : null,
        last: generateUrl(totalPages),
      },

      // The Meta Object for Totals
      meta: {
        "total-count": totalCount,
        "total-pages": totalPages,
        "page-size": pageSize,
        "current-page": pageNumber,
      },
    });
  } catch (error) {
    console.error("Route Handler Error:", error);
    return res.status(500).json({
      errors: [
        {
          status: 500,
          title: "Internal Server Error",
          detail: "An unexpected error occurred while processing the request.",
        },
      ],
    });
  }
});

/**
 * PATCH /api/study-jams/:id - Update a Study Jam
 */
studyJamRouter.patch("/:id", async (req, res) => {
  // --- 1. Security Check ---
  const user = req.user;
  if (!user || user.customClaims?.role !== "admin") {
    return res.status(user ? 403 : 401).json({
      errors: [
        {
          status: user ? 403 : 401,
          title: user ? "Forbidden" : "Unauthorized",
          detail: "You do not have permission to perform this action.",
        },
      ],
    });
  }

  const { id } = req.params;

  // --- 2. Input Validation ---
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

  // Validate body structure and ID match
  const parse = patchStudyJamBodySchema.safeParse(body);
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

  // Ensure the ID in the URL matches the ID in the body (JSON:API Best Practice)
  if (parse.data.data.id !== id) {
    return res.status(409).json({
      errors: [
        {
          status: 409,
          title: "Conflict",
          detail: "ID in URL does not match ID in body.",
        },
      ],
    });
  }

  // --- 3. Supabase Update ---
  try {
    const { data, error } = await supabase
      .from("studyJams")
      .update(parse.data.data.attributes)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // Handle case where record doesn't exist
      if (error.code === "PGRST116") {
        // Supabase/Postgres error for empty result on .single()
        return res.status(404).json({
          errors: [
            {
              status: 404,
              title: "Not Found",
              detail: `Study Jam with id ${id} not found.`,
            },
          ],
        });
      }

      return res.status(400).json({
        errors: [
          { status: 400, title: "Database Error", detail: error.message },
        ],
      });
    }

    // --- 4. Success Response ---
    return res.json({
      data: {
        type: "studyJams",
        id: data.id,
        attributes: data,
      },
    });
  } catch (err: unknown) {
    console.error("Patch Error:", err);
    return res.status(500).json({
      errors: [
        {
          status: 500,
          title: "Internal Server Error",
          detail: "An unexpected error occurred.",
        },
      ],
    });
  }
});

/**
 * DELETE /api/study-jams/:id - Delete a Study Jam and return the deleted record
 */
studyJamRouter.delete("/:id", async (req, res) => {
  // --- 1. Security Check ---
  const user = req.user;
  if (!user || user.customClaims?.role !== "admin") {
    return res.status(user ? 403 : 401).json({
      errors: [
        {
          status: user ? 403 : 401,
          title: user ? "Forbidden" : "Unauthorized",
          detail: "You do not have permission to perform this action.",
        },
      ],
    });
  }

  const { id } = req.params;

  // --- 2. Supabase Delete ---
  try {
    const { data, error } = await supabase
      .from("studyJams")
      .delete()
      .eq("id", id)
      .select() // <--- This is the key change: Retrieve the data we just deleted
      .single(); // <--- Ensure we only operated on one row

    if (error) {
      // Check for "No rows found" error from .single()
      // PGRST116 is the standard PostgREST error code for empty result sets on .single()
      if (error.code === "PGRST116") {
        return res.status(404).json({
          errors: [
            {
              status: 404,
              title: "Not Found",
              detail: `Study Jam with id ${id} not found.`,
            },
          ],
        });
      }

      return res.status(400).json({
        errors: [
          { status: 400, title: "Database Error", detail: error.message },
        ],
      });
    }

    // --- 3. Success Response (200 OK) ---
    // We now return the deleted data in JSON:API format
    return res.status(200).json({
      meta: {
        message: "Resource successfully deleted",
      },
      data: {
        type: "studyJams",
        id: data.id,
        attributes: data,
      },
    });
  } catch (err: unknown) {
    console.error("Delete Error:", err);
    return res.status(500).json({
      errors: [
        {
          status: 500,
          title: "Internal Server Error",
          detail: "An unexpected error occurred.",
        },
      ],
    });
  }
});

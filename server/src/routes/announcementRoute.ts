import { Router } from "express";
import { TablesInsert, TablesUpdate } from "../types/database.types.js";
import { supabase } from "../lib/supabase.js";

export type AnnouncementResource = {
  type: "announcements";
  id: string;
  attributes: {
    title: string;
    content: string;
    created_at: string;
    banner_url?: string | null;
  };
  relationships: {
    creator: {
      data: {
        type: "users";
        id: string;
      };
    };
  };
};

const toResource = (row: {
  id: number;
  title: string;
  content: string;
  created_at: string;
  creator_id: string;
  banner_url: string | null;
}): AnnouncementResource => ({
  type: "announcements",
  id: String(row.id),
  attributes: {
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    banner_url: row.banner_url,
  },
  relationships: {
    creator: {
      data: {
        type: "users",
        id: row.creator_id,
      },
    },
  },
});

const router = Router();

router.get("/", async (req, res) => {
  const pageNumber = Math.max(parseInt(req.query["page[number]"] as string) || 1, 1);
  const pageSize = Math.max(parseInt(req.query["page[size]"] as string) || 10, 1);
  const from = (pageNumber - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("announcement")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return res.status(500).json({
      errors: [
        { status: 500, title: "Database Error", detail: error.message },
      ],
    });
  }

  const totalRecords = count ?? 0;
  const totalPages = Math.max(Math.ceil(totalRecords / pageSize), 1);
  const resources = (data ?? []).map(toResource);

  const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
  const buildLink = (p: number) => `${baseUrl}?page[number]=${p}&page[size]=${pageSize}`;

  res.set("Content-Type", "application/vnd.api+json");
  return res.json({
    meta: {
      success: true,
      message: "hello from the gdg webdev platform api announcement route",
      total_records: totalRecords,
      total_pages: totalPages,
      page: {
        current: pageNumber,
        size: pageSize,
      },
    },
    links: {
      self: buildLink(pageNumber),
      first: buildLink(1),
      last: buildLink(totalPages),
      ...(pageNumber > 1 && { prev: buildLink(pageNumber - 1) }),
      ...(pageNumber < totalPages && { next: buildLink(pageNumber + 1) }),
    },
    data: resources,
  });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      errors: [{ status: 400, title: "Invalid Request", detail: "id must be a number" }],
    });
  }

  const { data, error } = await supabase
    .from("announcement")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(404).json({
        errors: [{ status: 404, title: "Not Found", detail: `Announcement ${id} not found.` }],
      });
    }

    return res.status(500).json({
      errors: [
        { status: 500, title: "Database Error", detail: error.message },
      ],
    });
  }

  res.set("Content-Type", "application/vnd.api+json");
  return res.status(200).json({ data: toResource(data) });
});

router.post("/", async (req, res) => {
  const { title, content, creatorId, bannerUrl } = req.body ?? {};

  if (typeof title !== "string" || typeof content !== "string" || !title.trim() || !content.trim()) {
    return res.status(400).json({
      errors: [{ status: 400, title: "Invalid Request", detail: "Both title and content are required strings." }],
    });
  }

  const insertDto: TablesInsert<"announcement"> = {
    title: title.trim(),
    content: content.trim(),
    creator_id: typeof creatorId === "string" && creatorId.trim() ? creatorId.trim() : "system",
    banner_url: typeof bannerUrl === "string" ? bannerUrl : null,
  };

  const { data, error } = await supabase
    .from("announcement")
    .insert(insertDto)
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({
      errors: [
        { status: 500, title: "Database Error", detail: error.message },
      ],
    });
  }

  res.set("Content-Type", "application/vnd.api+json");
  return res.status(201).json({ data: toResource(data) });
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      errors: [{ status: 400, title: "Invalid Request", detail: "id must be a number" }],
    });
  }

  const { title, content, bannerUrl } = req.body ?? {};
  const updateDto: TablesUpdate<"announcement"> = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        errors: [{ status: 400, title: "Invalid Request", detail: "Title must be a non-empty string when provided." }],
      });
    }
    updateDto.title = title.trim();
  }

  if (content !== undefined) {
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        errors: [{ status: 400, title: "Invalid Request", detail: "Content must be a non-empty string when provided." }],
      });
    }
    updateDto.content = content.trim();
  }

  if (bannerUrl !== undefined) {
    if (bannerUrl !== null && typeof bannerUrl !== "string") {
      return res.status(400).json({
        errors: [{ status: 400, title: "Invalid Request", detail: "bannerUrl must be a string or null." }],
      });
    }
    updateDto.banner_url = bannerUrl;
  }

  const { data, error } = await supabase
    .from("announcement")
    .update(updateDto)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(404).json({
        errors: [{ status: 404, title: "Not Found", detail: `Announcement ${id} not found.` }],
      });
    }

    return res.status(500).json({
      errors: [
        { status: 500, title: "Database Error", detail: error.message },
      ],
    });
  }

  res.set("Content-Type", "application/vnd.api+json");
  return res.status(200).json({ data: toResource(data) });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      errors: [{ status: 400, title: "Invalid Request", detail: "id must be a number" }],
    });
  }

  const { error } = await supabase.from("announcement").delete().eq("id", id);

  if (error) {
    return res.status(500).json({
      errors: [
        { status: 500, title: "Database Error", detail: error.message },
      ],
    });
  }

  return res.status(204).send();
});

export const announcementRouter = router;

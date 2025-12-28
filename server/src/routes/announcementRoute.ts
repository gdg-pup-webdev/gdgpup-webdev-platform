import { Router } from "express";

export const announcementRouter = Router();

type AnnouncementResource = {
  type: "announcements";
  id: string;
  attributes: {
    title: string;
    content: string;
    created_at: string;
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

let announcements: AnnouncementResource[] = Array.from(
  { length: 55 },
  (_, idx) => {
    const id = String(idx + 1);
    return {
      type: "announcements",
      id,
      attributes: {
        title: `Announcement Title ${id}`,
        content: `This is the content of announcement ${id}.`,
        created_at: new Date().toISOString(),
      },
      relationships: {
        creator: {
          data: { type: "users", id: String(idx + 101) },
        },
      },
    } satisfies AnnouncementResource;
  }
);

announcementRouter.get("/", (req, res) => {
  // 1. Parse Pagination Params (JSON:API uses page[number] and page[size])
  // We use defaults: page 1, size 10
  const pageNumber = parseInt(req.query["page[number]"] as string) || 1;
  const pageSize = parseInt(req.query["page[size]"] as string) || 10;
  
  // Mock Database Stats
  const totalRecords = announcements.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  // 2. Calculate Slicing Logic
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  
  // 3. Generate Resources for JUST this page
  const resources = announcements.slice(startIndex, endIndex);

  // 4. Helper to build link URLs
  // This keeps the base URL and just updates the page params
  const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
  const buildLink = (p: number) => `${baseUrl}?page[number]=${p}&page[size]=${pageSize}`;

  // 5. Construct Response
  res.set("Content-Type", "application/vnd.api+json");
  
  res.json({
    meta: {
      success: true,
      message: "hello from the gdg webdev platform api announcement route",
      // Standard pagination meta
      total_records: totalRecords,
      total_pages: totalPages,
      page: {
        current: pageNumber,
        size: pageSize
      }
    },
    links: {
      self: buildLink(pageNumber),
      first: buildLink(1),
      last: buildLink(totalPages),
      // Only add prev/next if they exist
      ...(pageNumber > 1 && { prev: buildLink(pageNumber - 1) }),
      ...(pageNumber < totalPages && { next: buildLink(pageNumber + 1) }),
    },
    data: resources
  });
});

announcementRouter.get("/:id", (req, res) => {
  const announcement = announcements.find((item) => item.id === req.params.id);

  if (!announcement) {
    return res.status(404).json({
      errors: [
        {
          status: 404,
          title: "Not Found",
          detail: `Announcement ${req.params.id} not found.`,
        },
      ],
    });
  }

  res.set("Content-Type", "application/vnd.api+json");
  return res.status(200).json({ data: announcement });
});

announcementRouter.post("/", (req, res) => {
  const { title, content, creatorId } = req.body ?? {};

  if (typeof title !== "string" || typeof content !== "string" || !title.trim() || !content.trim()) {
    return res.status(400).json({
      errors: [
        {
          status: 400,
          title: "Invalid Request",
          detail: "Both title and content are required strings.",
        },
      ],
    });
  }

  const nextId = announcements.length
    ? String(Math.max(...announcements.map((item) => Number(item.id))) + 1)
    : "1";

  const newAnnouncement: AnnouncementResource = {
    type: "announcements",
    id: nextId,
    attributes: {
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
    },
    relationships: {
      creator: {
        data: {
          type: "users",
          id: typeof creatorId === "string" && creatorId.trim() ? creatorId.trim() : "system",
        },
      },
    },
  };

  announcements = [...announcements, newAnnouncement];

  res.set("Content-Type", "application/vnd.api+json");
  return res.status(201).json({ data: newAnnouncement });
});

announcementRouter.put("/:id", (req, res) => {
  const announcementIndex = announcements.findIndex((item) => item.id === req.params.id);

  if (announcementIndex === -1) {
    return res.status(404).json({
      errors: [
        {
          status: 404,
          title: "Not Found",
          detail: `Announcement ${req.params.id} not found.`,
        },
      ],
    });
  }

  const { title, content } = req.body ?? {};
  if (
    (title !== undefined && typeof title !== "string") ||
    (content !== undefined && typeof content !== "string")
  ) {
    return res.status(400).json({
      errors: [
        {
          status: 400,
          title: "Invalid Request",
          detail: "Title and content must be strings when provided.",
        },
      ],
    });
  }

  const existing = announcements[announcementIndex];
  const updated: AnnouncementResource = {
    ...existing,
    attributes: {
      ...existing.attributes,
      title: typeof title === "string" && title.trim() ? title.trim() : existing.attributes.title,
      content: typeof content === "string" && content.trim() ? content.trim() : existing.attributes.content,
    },
  };

  announcements[announcementIndex] = updated;

  res.set("Content-Type", "application/vnd.api+json");
  return res.status(200).json({ data: updated });
});

announcementRouter.delete("/:id", (req, res) => {
  const announcementIndex = announcements.findIndex((item) => item.id === req.params.id);

  if (announcementIndex === -1) {
    return res.status(404).json({
      errors: [
        {
          status: 404,
          title: "Not Found",
          detail: `Announcement ${req.params.id} not found.`,
        },
      ],
    });
  }

  announcements.splice(announcementIndex, 1);

  return res.status(204).send();
});
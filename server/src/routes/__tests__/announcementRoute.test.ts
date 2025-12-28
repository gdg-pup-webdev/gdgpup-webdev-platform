import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { announcementRouter } from "../announcementRoute.js";

type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  creator_id: string;
  created_at: string;
  banner_url: string | null;
};

vi.mock("../../lib/supabase.js", () => {
  let rows: AnnouncementRow[] = [];

  const setData = (seed: AnnouncementRow[]) => {
    rows = seed.map((row) => ({ ...row }));
  };

  const supabase = {
    from: (_table: string) => ({
      select: (_cols?: string, opts?: { count?: string }) => ({
        order: (_col: string, { ascending = true } = {}) => ({
          range: async (from: number, to: number) => {
            const sorted = [...rows].sort((a, b) =>
              ascending
                ? a.created_at.localeCompare(b.created_at)
                : b.created_at.localeCompare(a.created_at)
            );
            const slice = sorted.slice(from, to + 1);
            return { data: slice, count: opts?.count ? rows.length : null, error: null };
          },
        }),
        eq: (field: keyof AnnouncementRow, value: AnnouncementRow[keyof AnnouncementRow]) => ({
          single: async () => {
            const row = rows.find((r) => r[field] === value);
            if (!row) {
              return { data: null, error: { code: "PGRST116", message: "Not found" } as any };
            }
            return { data: { ...row }, error: null };
          },
        }),
        single: async () => {
          const row = rows[0];
          if (!row) {
            return { data: null, error: { code: "PGRST116", message: "Not found" } as any };
          }
          return { data: { ...row }, error: null };
        },
      }),
      insert: (payload: any) => {
        const rowsToInsert = Array.isArray(payload) ? payload : [payload];
        rowsToInsert.forEach((p) => {
          const nextId = rows.length ? Math.max(...rows.map((r) => Number(r.id))) + 1 : 1;
          rows.push({
            id: `${nextId}`,
            title: p.title,
            content: p.content,
            creator_id: p.creator_id,
            banner_url: p.banner_url ?? null,
            created_at: p.created_at ?? new Date().toISOString(),
          });
        });
        const last = rows[rows.length - 1];
        return {
          select: () => ({
            single: async () => ({ data: { ...last }, error: null }),
          }),
        };
      },
      update: (payload: any) => ({
        eq: (field: keyof AnnouncementRow, value: AnnouncementRow[keyof AnnouncementRow]) => ({
          select: () => ({
            single: async () => {
              const idx = rows.findIndex((r) => r[field] === value);
              if (idx === -1) {
                return { data: null, error: { code: "PGRST116", message: "Not found" } as any };
              }
              rows[idx] = { ...rows[idx], ...payload };
              return { data: { ...rows[idx] }, error: null };
            },
          }),
        }),
      }),
      delete: () => ({
        eq: (field: keyof AnnouncementRow, value: AnnouncementRow[keyof AnnouncementRow]) => {
          const idx = rows.findIndex((r) => r[field] === value);
          if (idx === -1) return { error: { code: "PGRST116", message: "Not found" } as any };
          rows.splice(idx, 1);
          return { error: null };
        },
      }),
    }),
  };

  return { supabase, __setAnnouncementData: setData };
});

// Import after mocks are registered
// @ts-expect-error provided by vi.mock in this test file
import { __setAnnouncementData } from "../../lib/supabase.js";

const buildRows = (count = 5): AnnouncementRow[] =>
  Array.from({ length: count }, (_, idx) => ({
    id: `${idx + 1}`,
    title: `Announcement Title ${idx + 1}`,
    content: `This is the content of announcement ${idx + 1}.`,
    created_at: new Date(2020, 0, idx + 1).toISOString(),
    creator_id: `user-${idx + 1}`,
    banner_url: null,
  }));

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/announcements", announcementRouter);
  return app;
};

beforeEach(() => {
  __setAnnouncementData(buildRows(12));
});

describe("announcement routes", () => {
  test("lists announcements with pagination", async () => {
    const app = createApp();

    const res = await request(app).get(
      "/api/announcements?page[number]=2&page[size]=5"
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.meta.total_records).toBe(12);
    expect(res.body.meta.page).toEqual({ current: 2, size: 5 });
    expect(res.body.links.self).toContain("page[number]=2");
  });

  test("gets a single announcement", async () => {
    const seed = buildRows(3);
    __setAnnouncementData(seed);
    const target = seed[1];
    const app = createApp();

    const res = await request(app).get(`/api/announcements/${target.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(target.id);
    expect(res.body.data.attributes.title).toContain(target.id);
  });

  test("returns 404 when announcement is missing", async () => {
    const app = createApp();

    const res = await request(app).get("/api/announcements/999");

    expect(res.status).toBe(404);
    expect(res.body.errors?.[0]?.title).toBe("Not Found");
  });

  test("creates a new announcement", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/announcements")
      .send({ title: "New title", content: "New content", creatorId: "123" });

    expect(res.status).toBe(201);
    expect(res.body.data.attributes.title).toBe("New title");
    expect(res.body.data.relationships.creator.data.id).toBe("123");
  });

  test("validates create payload", async () => {
    const app = createApp();

    const res = await request(app)
      .post("/api/announcements")
      .send({ title: "", content: 42 });

    expect(res.status).toBe(400);
    expect(res.body.errors?.[0]?.title).toBe("Invalid Request");
  });

  test("updates an announcement", async () => {
    const seed = buildRows(2);
    __setAnnouncementData(seed);
    const targetId = seed[0].id;
    const app = createApp();

    const res = await request(app)
      .put(`/api/announcements/${targetId}`)
      .send({ title: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data.attributes.title).toBe("Updated");
  });

  test("returns 404 on update when missing", async () => {
    const app = createApp();

    const res = await request(app)
      .put("/api/announcements/404")
      .send({ title: "Updated" });

    expect(res.status).toBe(404);
  });

  test("deletes an announcement", async () => {
    const seed = buildRows(2);
    __setAnnouncementData(seed);
    const targetId = seed[0].id;
    const app = createApp();

    const res = await request(app).delete(`/api/announcements/${targetId}`);

    expect(res.status).toBe(204);

    const followUp = await request(app).get(`/api/announcements/${targetId}`);
    expect(followUp.status).toBe(404);
  });
});

export type Actions = "read" | "write" | "delete" | "update";

export const rolePermissions: Record<string, Record<string, Actions[]>> = {
  admin: {
    messages: ["read", "write", "delete"],
    blogs: ["read", "write", "delete"],
  },
  user: {
    messages: ["write"],
    blogs: ["read"],
  },
};

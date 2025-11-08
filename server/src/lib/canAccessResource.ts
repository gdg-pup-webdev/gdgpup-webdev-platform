import { Actions, rolePermissions } from "../config/roles.js";

export function canAccessResource(
  role: string,
  resource: string,
  action: Actions
) {
  const allowed = rolePermissions[role]?.[resource] || [];
  return allowed.includes(action);
}

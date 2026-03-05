export type TenantRole = "owner" | "admin" | "editor" | "viewer";

export function canEdit(role: TenantRole) {
  return role === "owner" || role === "admin" || role === "editor";
}

export function canAdmin(role: TenantRole) {
  return role === "owner" || role === "admin";
}

export function canOwner(role: TenantRole) {
  return role === "owner";
}

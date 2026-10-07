// src/lib/permissions.ts
// Miroir côté app des règles RLS (migration roles_and_favorites) : sert
// uniquement à afficher ou masquer les actions. La base reste l'arbitre.
import { ROLES, type ActivityRow, type Role } from "../types";

// role est le texte brut de profiles.role (null si non connecté)
export function hasRole(role: string | null | undefined, min: Role): boolean {
  if (!role) return false;
  const level = ROLES.indexOf(role as Role);
  return level >= 0 && level >= ROLES.indexOf(min);
}

export type ActivityPermissions = {
  canEdit: boolean;
  canPublish: boolean;
  canUnpublish: boolean; // repasser en brouillon
  canArchive: boolean;
  canDelete: boolean;
};

export function activityPermissions(
  activity: Pick<ActivityRow, "created_by" | "status">,
  userId: string | null | undefined,
  role: string | null | undefined,
): ActivityPermissions {
  const isOwner =
    !!userId && activity.created_by === userId && hasRole(role, "contributeur");
  const isAdmin = hasRole(role, "administrateur");
  // Un modérateur agit sur les activités des autres, sauf les brouillons
  const isModerating =
    hasRole(role, "moderateur") && activity.status !== "draft";

  const full = isOwner || isAdmin;
  const canEdit = full || isModerating;

  return {
    canEdit,
    canPublish: canEdit && activity.status !== "published",
    canUnpublish: full && activity.status === "published",
    canArchive: canEdit && activity.status !== "archived",
    canDelete: full,
  };
}

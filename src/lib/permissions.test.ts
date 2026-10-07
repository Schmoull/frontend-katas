import { describe, expect, it } from "vitest";
import { activityPermissions, hasRole } from "./permissions";

const OWNER = "user-owner";
const OTHER = "user-other";

function activity(status: "draft" | "published" | "archived") {
  return { created_by: OWNER, status };
}

describe("hasRole", () => {
  it("refuse un utilisateur non connecté ou un rôle inconnu", () => {
    expect(hasRole(null, "visiteur")).toBe(false);
    expect(hasRole(undefined, "visiteur")).toBe(false);
    expect(hasRole("animateur", "visiteur")).toBe(false);
  });

  it("applique la hiérarchie visiteur < contributeur < moderateur < administrateur", () => {
    expect(hasRole("visiteur", "visiteur")).toBe(true);
    expect(hasRole("visiteur", "contributeur")).toBe(false);
    expect(hasRole("contributeur", "visiteur")).toBe(true);
    expect(hasRole("moderateur", "contributeur")).toBe(true);
    expect(hasRole("moderateur", "administrateur")).toBe(false);
    expect(hasRole("administrateur", "moderateur")).toBe(true);
    expect(hasRole("administrateur", "administrateur")).toBe(true);
  });
});

describe("activityPermissions", () => {
  it("ne donne aucun droit à un visiteur non connecté", () => {
    expect(activityPermissions(activity("published"), null, null)).toEqual({
      canEdit: false,
      canPublish: false,
      canUnpublish: false,
      canArchive: false,
      canDelete: false,
    });
  });

  it("ne donne aucun droit à un visiteur sur l'activité d'un autre", () => {
    const can = activityPermissions(activity("published"), OTHER, "visiteur");
    expect(can.canEdit).toBe(false);
    expect(can.canDelete).toBe(false);
  });

  describe("contributeur auteur de l'activité", () => {
    it("peut tout faire sur son brouillon", () => {
      expect(
        activityPermissions(activity("draft"), OWNER, "contributeur"),
      ).toEqual({
        canEdit: true,
        canPublish: true,
        canUnpublish: false,
        canArchive: true,
        canDelete: true,
      });
    });

    it("peut repasser son activité publiée en brouillon", () => {
      const can = activityPermissions(
        activity("published"),
        OWNER,
        "contributeur",
      );
      expect(can.canPublish).toBe(false);
      expect(can.canUnpublish).toBe(true);
      expect(can.canArchive).toBe(true);
    });

    it("peut republier son activité archivée", () => {
      const can = activityPermissions(
        activity("archived"),
        OWNER,
        "contributeur",
      );
      expect(can.canPublish).toBe(true);
      expect(can.canArchive).toBe(false);
    });

    it("perd ses droits s'il est rétrogradé visiteur", () => {
      const can = activityPermissions(activity("published"), OWNER, "visiteur");
      expect(can).toEqual({
        canEdit: false,
        canPublish: false,
        canUnpublish: false,
        canArchive: false,
        canDelete: false,
      });
    });
  });

  it("ne donne aucun droit à un contributeur sur l'activité d'un autre", () => {
    const can = activityPermissions(
      activity("published"),
      OTHER,
      "contributeur",
    );
    expect(can.canEdit).toBe(false);
    expect(can.canArchive).toBe(false);
    expect(can.canDelete).toBe(false);
  });

  describe("modérateur sur l'activité d'un autre", () => {
    it("peut modifier et archiver une activité publiée, sans la supprimer ni la repasser en brouillon", () => {
      expect(
        activityPermissions(activity("published"), OTHER, "moderateur"),
      ).toEqual({
        canEdit: true,
        canPublish: false,
        canUnpublish: false,
        canArchive: true,
        canDelete: false,
      });
    });

    it("peut republier une activité archivée", () => {
      const can = activityPermissions(
        activity("archived"),
        OTHER,
        "moderateur",
      );
      expect(can.canEdit).toBe(true);
      expect(can.canPublish).toBe(true);
      expect(can.canArchive).toBe(false);
    });

    it("n'a aucun droit sur un brouillon", () => {
      const can = activityPermissions(activity("draft"), OTHER, "moderateur");
      expect(can.canEdit).toBe(false);
      expect(can.canPublish).toBe(false);
      expect(can.canArchive).toBe(false);
      expect(can.canDelete).toBe(false);
    });
  });

  it("donne tous les droits à un administrateur, même sur le brouillon d'un autre", () => {
    expect(
      activityPermissions(activity("draft"), OTHER, "administrateur"),
    ).toEqual({
      canEdit: true,
      canPublish: true,
      canUnpublish: false,
      canArchive: true,
      canDelete: true,
    });
    expect(
      activityPermissions(activity("published"), OTHER, "administrateur")
        .canUnpublish,
    ).toBe(true);
  });
});

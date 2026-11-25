import { describe, expect, it } from "vitest";
import { activityTypeStyle } from "./activityTypeStyle";

describe("activityTypeStyle", () => {
  it("donne la couleur et le pictogramme d'un type de la charte", () => {
    const style = activityTypeStyle("Sport");
    expect(style.className).toContain("bg-type-sport");
    expect(style.className).toContain("sur-sombre");
    expect(style.pictogram).toBeTruthy();
  });

  it("associe Créatif au type Bricolage de la charte", () => {
    expect(activityTypeStyle("Créatif").className).toContain(
      "bg-type-bricolage",
    );
  });

  it("retombe sur un aplat neutre pour un type absent de la charte", () => {
    expect(activityTypeStyle("Service")).toEqual({
      className: "bg-papier-fonce text-encre",
      pictogram: null,
    });
    expect(activityTypeStyle(null).pictogram).toBeNull();
  });
});

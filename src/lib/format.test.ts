import { afterEach, describe, expect, it } from "vitest";
import i18n from "i18next";
import {
  errorMessage,
  formatAgeBranch,
  formatDate,
  formatDuration,
  formatParticipants,
} from "./format";

// setupTests.ts démarre en français ; un test en allemand revient au français
afterEach(async () => {
  await i18n.changeLanguage("fr");
});

describe("formatDuration", () => {
  it("renvoie null sans durée", () => {
    expect(formatDuration(null)).toBeNull();
  });

  it("affiche les minutes, les heures, ou les deux", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(90)).toBe("1 h 30");
    expect(formatDuration(125)).toBe("2 h 05");
  });

  it("parle allemand", async () => {
    await i18n.changeLanguage("de");
    expect(formatDuration(45)).toBe("45 Min.");
    expect(formatDuration(125)).toBe("2 Std. 05");
  });
});

describe("formatParticipants", () => {
  it("gère toutes les combinaisons de min et max", () => {
    expect(formatParticipants(null, null)).toBeNull();
    expect(formatParticipants(8, 8)).toBe("8 participants");
    expect(formatParticipants(1, 1)).toBe("1 participant");
    expect(formatParticipants(5, 20)).toBe("5 à 20 participants");
    expect(formatParticipants(5, null)).toBe("5 participants min.");
    expect(formatParticipants(null, 20)).toBe("20 participants max.");
  });

  it("parle allemand", async () => {
    await i18n.changeLanguage("de");
    expect(formatParticipants(5, 20)).toBe("5 bis 20 Teilnehmende");
    expect(formatParticipants(5, null)).toBe("mind. 5 Teilnehmende");
  });
});

describe("formatAgeBranch", () => {
  const branch = {
    name: "Louveteaux",
    name_de: "Wölfe",
    name_it: "Lupetti",
    min_age: 6,
    max_age: 10,
  };

  it("affiche la tranche d'âge", () => {
    expect(formatAgeBranch(branch)).toBe("Louveteaux (6–10 ans)");
  });

  it("traite 99 comme « pas de limite »", () => {
    expect(
      formatAgeBranch({
        name: "Routiers",
        name_de: "Rover",
        name_it: "Rover",
        min_age: 17,
        max_age: 99,
      }),
    ).toBe("Routiers (dès 17 ans)");
  });

  it("utilise le nom allemand, ou le français s'il manque", async () => {
    await i18n.changeLanguage("de");
    expect(formatAgeBranch(branch)).toBe("Wölfe (6–10 Jahre)");
    expect(formatAgeBranch({ ...branch, name_de: null })).toBe(
      "Louveteaux (6–10 Jahre)",
    );
  });

  it("utilise le nom italien, ou le français s'il manque", async () => {
    await i18n.changeLanguage("it");
    expect(formatAgeBranch(branch)).toBe("Lupetti (6–10 anni)");
    expect(formatAgeBranch({ ...branch, name_it: null })).toBe(
      "Louveteaux (6–10 anni)",
    );
  });
});

describe("formatDate", () => {
  it("renvoie null sans date", () => {
    expect(formatDate(null)).toBeNull();
  });

  it("formate dans la langue active", async () => {
    // Midi UTC : même jour quel que soit le fuseau de la machine
    expect(formatDate("2026-10-07T12:00:00Z")).toBe("7 octobre 2026");
    await i18n.changeLanguage("de");
    expect(formatDate("2026-10-07T12:00:00Z")).toBe("7. Oktober 2026");
  });
});

describe("errorMessage", () => {
  it("traduit une contrainte connue de la base", () => {
    const error = {
      message:
        'new row for relation "activities" violates check constraint "activities_participants_range_check"',
    };
    expect(errorMessage(error, "fallback")).toBe(
      "Le nombre minimum de participants dépasse le nombre maximum.",
    );
  });

  it("traduit une violation d'unicité", () => {
    const error = {
      message:
        'duplicate key value violates unique constraint "activity_types_name_key"',
    };
    expect(errorMessage(error, "fallback")).toBe("Un type porte déjà ce nom.");
  });

  it("traduit un message levé par une fonction SQL", async () => {
    const error = { message: "Réservé aux administrateurs" };
    expect(errorMessage(error, "x")).toBe("Réservé aux administrateurs.");
    await i18n.changeLanguage("de");
    expect(errorMessage(error, "x")).toBe("Nur für Administrator:innen.");
  });

  it("garde le message d'origine s'il n'est pas connu", () => {
    expect(errorMessage({ message: "Invalid login credentials" }, "x")).toBe(
      "Invalid login credentials",
    );
  });

  it("utilise le message par défaut sinon", () => {
    expect(errorMessage(null, "Erreur")).toBe("Erreur");
    expect(errorMessage("oups", "Erreur")).toBe("Erreur");
    expect(errorMessage({ message: "" }, "Erreur")).toBe("Erreur");
  });
});

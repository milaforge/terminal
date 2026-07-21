import { describe, expect, it } from "vitest";
import { buildShareLink, parseShareCommandsFromLocation } from "../shareLink";

function locationWithSearch(search: string): Location {
  return { search } as Location;
}

describe("share links", () => {
  it("accepts the selected work command for direct Works links", () => {
    const commands = parseShareCommandsFromLocation(
      locationWithSearch("?run=selected_cases"),
    );

    expect(commands).toEqual(["selected_cases"]);
  });

  it("builds a direct Works link from the selected work command", () => {
    const link = buildShareLink("selected_cases", "https://example.test/");

    expect(link).toBe("https://example.test/?run=selected_cases");
  });

  it("accepts double-encoded consolidated blog read commands", () => {
    const commands = parseShareCommandsFromLocation(
      locationWithSearch("?run=blog%2520read%25202025-01-21-tab"),
    );

    expect(commands).toEqual(["blog read 2025-01-21-tab"]);
  });

  it("rejects removed plural and log command aliases", () => {
    const commands = parseShareCommandsFromLocation(
      locationWithSearch("?run=blogs%2520read%25202025-01-21-tab|logs%2520read%25202025-01-21-tab"),
    );

    expect(commands).toEqual([]);
  });
});

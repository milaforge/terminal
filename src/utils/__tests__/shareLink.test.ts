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

  it("accepts selected case read commands for direct case modal links", () => {
    const commands = parseShareCommandsFromLocation(
      locationWithSearch("?run=selected_cases%2520read%2520investor-demo-shipped-in-10-days"),
    );

    expect(commands).toEqual([
      "selected_cases read investor-demo-shipped-in-10-days",
    ]);
  });

  it("builds direct selected case read links", () => {
    const link = buildShareLink(
      "selected_cases read investor-demo-shipped-in-10-days",
      "https://example.test/terminal/",
    );

    expect(link).toBe(
      "https://example.test/terminal/?run=selected_cases%2520read%2520investor-demo-shipped-in-10-days",
    );
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

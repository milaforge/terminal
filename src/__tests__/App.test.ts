import { describe, expect, it } from "vitest";
import { shouldShowStoryRoute } from "../App";

describe("shouldShowStoryRoute", () => {
  it("uses the story as the default site entry", () => {
    expect(shouldShowStoryRoute("")).toBe(true);
    expect(shouldShowStoryRoute("#")).toBe(true);
  });

  it("keeps story routes explicit and ignores the removed terminal hash route", () => {
    expect(shouldShowStoryRoute("#/story")).toBe(true);
    expect(shouldShowStoryRoute("#/story/chapter-1")).toBe(true);
    expect(shouldShowStoryRoute("#/terminal")).toBe(true);
  });
});

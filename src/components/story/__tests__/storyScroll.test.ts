import { describe, expect, it } from "vitest";
import {
  getStoryStartupCommandFromLocation,
  getNextStorySceneIndex,
  getStorySceneScrollTarget,
} from "../index";

describe("story scroll snapping", () => {
  it("maps a shared selected work URL to the Works startup command", () => {
    expect(
      getStoryStartupCommandFromLocation({
        search: "?run=selected_cases",
      } as Location),
    ).toEqual({
      command: "selected_cases",
      typing: "simulate",
    });
  });

  it("ignores unsupported shared commands on the story surface", () => {
    expect(
      getStoryStartupCommandFromLocation({
        search: "?run=logs%2520read%25202025-01-21-tab",
      } as Location),
    ).toBeNull();
  });

  it("moves one scene in the wheel direction", () => {
    expect(
      getNextStorySceneIndex({ activeScene: 2, deltaY: 100, sceneCount: 5 }),
    ).toBe(3);
    expect(
      getNextStorySceneIndex({ activeScene: 2, deltaY: -100, sceneCount: 5 }),
    ).toBe(1);
  });

  it("ignores tiny wheel deltas and outward edge scrolls", () => {
    expect(
      getNextStorySceneIndex({ activeScene: 2, deltaY: 3, sceneCount: 5 }),
    ).toBeNull();
    expect(
      getNextStorySceneIndex({ activeScene: 0, deltaY: -100, sceneCount: 5 }),
    ).toBeNull();
    expect(
      getNextStorySceneIndex({ activeScene: 4, deltaY: 100, sceneCount: 5 }),
    ).toBeNull();
  });

  it("targets the middle of the requested scene segment", () => {
    expect(
      getStorySceneScrollTarget({
        index: 1,
        sceneCount: 4,
        trackTop: 100,
        scrollable: 800,
      }),
    ).toBe(400);
  });

  it("clamps target scenes to the available range", () => {
    expect(
      getStorySceneScrollTarget({
        index: -1,
        sceneCount: 4,
        trackTop: 100,
        scrollable: 800,
      }),
    ).toBe(100);
    expect(
      getStorySceneScrollTarget({
        index: 99,
        sceneCount: 4,
        trackTop: 100,
        scrollable: 800,
      }),
    ).toBe(900);
  });

  it("targets the top of the intro so the avatar returns home", () => {
    expect(
      getStorySceneScrollTarget({
        index: 0,
        sceneCount: 4,
        trackTop: 100,
        scrollable: 800,
      }),
    ).toBe(100);
  });

  it("targets the end of the final scene so the outro cannot scroll past center", () => {
    expect(
      getStorySceneScrollTarget({
        index: 3,
        sceneCount: 4,
        trackTop: 100,
        scrollable: 800,
      }),
    ).toBe(900);
  });
});

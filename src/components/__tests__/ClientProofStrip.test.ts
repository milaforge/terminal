import { describe, expect, it } from "vitest";
import { getClientTooltipPosition } from "../ClientProofStrip";

describe("ClientProofStrip tooltip positioning", () => {
  it("centers the tooltip below the icon strip while keeping the arrow on the hovered icon", () => {
    const position = getClientTooltipPosition({
      anchorRect: {
        left: 360,
        right: 400,
        top: 80,
        bottom: 120,
        width: 40,
      },
      tooltipWidth: 320,
      tooltipHeight: 100,
      viewportWidth: 800,
      viewportHeight: 640,
      preferredCenterX: 300,
      preferredTop: 132,
    });

    expect(position.x).toBe(140);
    expect(position.y).toBe(132);
    expect(position.arrowX).toBe(240);
  });

  it("clamps the centered tooltip inside the viewport", () => {
    const position = getClientTooltipPosition({
      anchorRect: {
        left: 390,
        right: 420,
        top: 80,
        bottom: 120,
        width: 30,
      },
      tooltipWidth: 320,
      tooltipHeight: 100,
      viewportWidth: 420,
      viewportHeight: 640,
      preferredCenterX: 405,
    });

    expect(position.x).toBeGreaterThanOrEqual(12);
    expect(position.x + position.width).toBeLessThanOrEqual(408);
    expect(position.arrowX).toBeLessThanOrEqual(position.width - 18);
  });
});

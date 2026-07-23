import { describe, expect, it } from "vitest";
import { getSystemDefaultColorId } from "../terminalColors";
import { getSystemDefaultFontId } from "../terminalFonts";

describe("system appearance defaults", () => {
  it("uses the paper theme color and font for light system preference", () => {
    expect(getSystemDefaultColorId(false)).toBe("clarity_light");
    expect(getSystemDefaultFontId(false)).toBe("plex");
  });

  it("uses the night_sky theme color and font for dark system preference", () => {
    expect(getSystemDefaultColorId(true)).toBe("night_sky");
    expect(getSystemDefaultFontId(true)).toBe("fira");
  });
});

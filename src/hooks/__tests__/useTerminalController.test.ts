import { describe, expect, it } from "vitest";
import { deletePreviousTerminalWord } from "../useTerminalController";

describe("deletePreviousTerminalWord", () => {
  it("deletes the word before the cursor like Alt+Backspace in a shell", () => {
    expect(deletePreviousTerminalWord("display color night_sky", 23)).toEqual({
      value: "display color ",
      caret: 14,
    });
  });

  it("deletes trailing space and the previous word", () => {
    expect(deletePreviousTerminalWord("cat resume.pdf   ", 17)).toEqual({
      value: "cat ",
      caret: 4,
    });
  });

  it("preserves text after a mid-line cursor", () => {
    expect(deletePreviousTerminalWord("download resume.pdf --verify", 19)).toEqual({
      value: "download --verify",
      caret: 9,
    });
  });

  it("deletes the selected range when a selection is active", () => {
    expect(deletePreviousTerminalWord("search agent reliability", 7, 12)).toEqual({
      value: "search reliability",
      caret: 7,
    });
  });
});

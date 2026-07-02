import { describe, expect, it } from "vitest";
import {
  getTerminalLineClassName,
  getTerminalLineCommandLabel,
  terminalLineHasCommandSegments,
} from "../TerminalLine";
import type { TerminalLine } from "@types";

describe("TerminalLineRow helpers", () => {
  it("detects command segments without depending on row rendering", () => {
    const line: TerminalLine = [
      { type: "text", text: "Run " },
      { type: "command", label: "status", command: "status" },
    ];

    expect(terminalLineHasCommandSegments(line)).toBe(true);
    expect(terminalLineHasCommandSegments([{ type: "text", text: "plain" }])).toBe(
      false,
    );
  });

  it("derives command labels from explicit text first, then prompt-prefixed rows", () => {
    expect(
      getTerminalLineCommandLabel({
        commandText: "files list",
        line: [{ type: "text", text: "> ignored" }],
        promptGlyph: ">",
      }),
    ).toBe("files list");

    expect(
      getTerminalLineCommandLabel({
        line: [{ type: "text", text: "$ search token" }],
        promptGlyph: "$",
      }),
    ).toBe("search token");
  });

  it("keeps row class composition deterministic", () => {
    expect(
      getTerminalLineClassName({
        className: "terminal-line",
        hasCommandSegments: true,
      }),
    ).toBe("terminal-line has-commands");

    expect(
      getTerminalLineClassName({
        hasCommandSegments: false,
      }),
    ).toBe("");
  });
});

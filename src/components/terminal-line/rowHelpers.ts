import type { TerminalLine } from "@types";

export function terminalLineHasCommandSegments(line: TerminalLine): boolean {
  return line.some((segment) => segment.type === "command");
}

export function terminalLineHasScrollableSegments(line: TerminalLine): boolean {
  return line.some((segment) => segment.type === "work");
}

export function getTerminalLineCommandLabel({
  commandText,
  line,
  promptGlyph,
}: {
  commandText?: string;
  line: TerminalLine;
  promptGlyph: string;
}): string {
  if (commandText) return commandText;

  const firstSegment = line[0];
  if (line.length === 1 && firstSegment?.type === "text") {
    const raw = firstSegment.text || "";
    const promptPrefix = `${promptGlyph} `;
    return raw.startsWith(promptPrefix) ? raw.slice(promptPrefix.length) : raw;
  }

  return "";
}

export function getTerminalLineClassName({
  className,
  hasCommandSegments,
}: {
  className?: string;
  hasCommandSegments: boolean;
}): string {
  return `${className || ""}${hasCommandSegments ? " has-commands" : ""}`.trim();
}

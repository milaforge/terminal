import type { TerminalLineProps } from "@types";
import { CommandLineButton } from "./terminal-line/CommandLineButton";
import { renderSegment } from "./terminal-line/renderSegment";
import {
  getTerminalLineClassName,
  getTerminalLineCommandLabel,
  terminalLineHasScrollableSegments,
  terminalLineHasCommandSegments,
} from "./terminal-line/rowHelpers";

export {
  getTerminalLineClassName,
  getTerminalLineCommandLabel,
  terminalLineHasScrollableSegments,
  terminalLineHasCommandSegments,
} from "./terminal-line/rowHelpers";

function renderLineContent({
  executeCommand,
  line,
  lineIndex,
}: Pick<TerminalLineProps, "executeCommand" | "line" | "lineIndex">) {
  if (line.length === 0) return [<span key={`line-${lineIndex}-empty`}></span>];

  return line.map((segment, idx) =>
    renderSegment(segment, `line-${lineIndex}-seg-${idx}`, executeCommand),
  );
}

export function TerminalLineRow({
  line,
  lineIndex,
  className,
  executeCommand,
  isCommandLine,
  isCollapsed,
  isHistoricalCommand,
  prompt,
  commandText,
  onToggleCollapse,
}: TerminalLineProps) {
  const promptGlyph = prompt || ">";
  const hasCommandSegments = terminalLineHasCommandSegments(line);
  const commandLabel = getTerminalLineCommandLabel({
    commandText,
    line,
    promptGlyph,
  });

  const interactiveContent = isCommandLine ? (
    <CommandLineButton
      commandLabel={commandLabel}
      isCollapsed={isCollapsed}
      isHistoricalCommand={isHistoricalCommand}
      onToggleCollapse={onToggleCollapse}
      promptGlyph={promptGlyph}
    />
  ) : (
    renderLineContent({ executeCommand, line, lineIndex })
  );

  return (
    <span
      className={getTerminalLineClassName({ className, hasCommandSegments })}
      data-line-index={lineIndex}
    >
      {interactiveContent}
    </span>
  );
}

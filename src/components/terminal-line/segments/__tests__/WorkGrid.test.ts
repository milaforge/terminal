import { describe, expect, it } from "vitest";
import {
  buildWorkSpark,
  getInitialWorkModalIndex,
  getWorkCardSummary,
} from "../WorkGrid";
import type { SelectedCase } from "@data/selectedCases";

describe("WorkGrid helpers", () => {
  it("uses the first non-heading markdown line as the card summary", () => {
    expect(
      getWorkCardSummary({
        title: "Case",
        description: "# Heading\n\n**Bounded retry** prevented duplicate work.",
      }),
    ).toBe("Bounded retry prevented duplicate work.");
  });

  it("uses selected case summaries directly", () => {
    const selectedCase: SelectedCase = {
      title: "Case",
      description: "Fallback body.",
      summary: "Structured editorial summary.",
      metric: { prefix: "", value: 1, suffix: "", label: "result" },
      context: { title: "Context", body: ["Client context."] },
      challenge: { eyebrow: "Challenge", title: "Challenge", body: ["Business challenge."] },
      solution: { eyebrow: "Intervention", title: "Solution", body: ["Intervention."] },
      results: {
        eyebrow: "Result",
        title: "Result",
        body: ["Result body."],
        highlights: ["Measurable result."],
      },
      tags: ["reliability"],
    };

    expect(
      getWorkCardSummary(selectedCase),
    ).toBe("Structured editorial summary.");
  });

  it("falls back when no usable summary line exists", () => {
    expect(
      getWorkCardSummary({
        title: "Empty",
        description: "# Heading\n\n## Details",
      }),
    ).toBe("Details coming soon.");
  });

  it("builds deterministic sparkline paths from metric points", () => {
    expect(buildWorkSpark([0.2, 0.5, 0.8])).toEqual({
      line: "M 0.0 28.0 L 50.0 19.0 L 100.0 10.0",
      area: "M 0.0 28.0 L 50.0 19.0 L 100.0 10.0 L 100.0 36 L 0.0 36 Z",
      endX: 100,
      endY: 10,
    });
  });

  it("accepts only valid initial case modal indexes", () => {
    const segment = {
      type: "work" as const,
      initialOpenIndex: 0,
      items: [
        {
          title: "Opened Case",
          description: "Markdown body",
          tags: ["reliability"],
        },
      ],
    };

    expect(getInitialWorkModalIndex(segment)).toBe(0);
    expect(getInitialWorkModalIndex({ ...segment, initialOpenIndex: 1 })).toBeNull();
    expect(getInitialWorkModalIndex({ ...segment, initialOpenIndex: -1 })).toBeNull();
    expect(getInitialWorkModalIndex({ ...segment, initialOpenIndex: undefined })).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { getSelectedCaseMetric, isSelectedCase, SELECTED_CASES } from "../selectedCases";

describe("selected case data", () => {
  it("keeps selected cases ordered, sluggable, and metric-backed", () => {
    const titles = new Set<string>();

    SELECTED_CASES.forEach((item, index) => {
      expect(item.index).toBe(index + 1);
      expect(item.title.trim()).toBe(item.title);
      expect(titles.has(item.title)).toBe(false);
      expect(item.eyebrow.length).toBeGreaterThan(0);
      expect(item.oneLiner.length).toBeGreaterThan(40);
      expect(item.problem.length).toBeGreaterThan(20);
      expect(item.decision.length).toBeGreaterThan(20);
      expect(item.proof.length).toBeGreaterThan(0);
      expect(item.description).toContain("## Problem");
      expect(item.description).toContain("## Decision");
      expect(item.description).toContain("## Proof");
      expect(item.description).not.toContain("## Business challenge");
      expect(item.metric.label).not.toBe("case study");
      expect(item.metric.points?.length).toBeGreaterThanOrEqual(2);
      expect(isSelectedCase(item)).toBe(true);
      titles.add(item.title);
    });
  });

  it("uses a bounded fallback metric for externally supplied sample work", () => {
    const metric = getSelectedCaseMetric(
      {
        title: "External Case",
        description: "Imported from props.",
      },
      2,
    );

    expect(metric.value).toBe(3);
    expect(metric.label).toBe("case study");
  });
});

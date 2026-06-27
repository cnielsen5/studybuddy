import {
  defaultObjectiveTrail,
  titleFromContentLine,
} from "../src/ingestors/contentTitles.js";
import { enrichObjectiveTrails } from "../src/ingestors/contentBlockExtractor.js";
import { normalizeParsedSection } from "../src/types/parsedSource.js";

describe("titleFromContentLine", () => {
  it("keeps full objective text when under max length", () => {
    const line =
      "Define homeostasis and explain its importance to normal human functioning";
    expect(titleFromContentLine(line)).toBe(line);
  });

  it("truncates at word boundaries, not mid-word", () => {
    const long =
      "Compare and contrast at least four medical imaging techniques in terms of their function and use in medicine";
    const title = titleFromContentLine(long, 60);
    expect(title.endsWith("functionin")).toBe(false);
    expect(title.length).toBeLessThanOrEqual(60);
  });
});

describe("enrichObjectiveTrails", () => {
  it("backfills chapter objective trail from page title", () => {
    const sections = enrichObjectiveTrails(
      [
        normalizeParsedSection({
          title: "Define homeostasis",
          body: "Define homeostasis and explain its importance",
          sequence: 1,
          level: 0,
          blockType: "objective_item",
          structuralHeadingTrail: [],
        }),
      ],
      "Ch. 1 Introduction - Anatomy and Physiology | OpenStax"
    );

    expect(sections[0].structuralHeadingTrail[0]).toMatch(/Ch\. 1.*Objectives/i);
  });
});

describe("defaultObjectiveTrail", () => {
  it("falls back to Chapter Objectives without page title", () => {
    expect(defaultObjectiveTrail()).toEqual(["Chapter Objectives"]);
  });
});

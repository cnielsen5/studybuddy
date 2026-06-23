import { mergeParsedSources } from "../src/ingestors/mergeParsedSources.js";
import { parseWebsiteHtml } from "../src/ingestors/website.js";
import { normalizeParsedSection } from "../src/types/parsedSource.js";

const PAGE_A = `
<html><head><title>Page A - Course</title></head>
<body><main><h1>Intro</h1><p>First page content.</p></main></body></html>`;

const PAGE_B = `
<html><head><title>Page B - Course</title></head>
<body><main><h1>Details</h1><p>Second page content.</p></main></body></html>`;

describe("mergeParsedSources", () => {
  it("combines sections from multiple pages in URL order", () => {
    const a = parseWebsiteHtml(PAGE_A, "https://example.com/page-a");
    const b = parseWebsiteHtml(PAGE_B, "https://example.com/page-b");

    const merged = mergeParsedSources([a, b], { label: "Chapter bundle" });

    expect(merged.sourceLabel).toBe("Chapter bundle");
    expect(merged.metadata?.sourceUrls).toEqual([
      "https://example.com/page-a",
      "https://example.com/page-b",
    ]);
    expect(merged.sections.length).toBe(a.sections.length + b.sections.length);
    expect(merged.sections[0].sourceUrl).toBe("https://example.com/page-a");
    expect(merged.sections.at(-1)?.sourceUrl).toBe("https://example.com/page-b");
    expect(merged.sections.every((s) => s.sequence > 0)).toBe(true);
  });

  it("preserves per-block source metadata when merging", () => {
    const single = {
      sourceType: "website" as const,
      sourceUrl: "https://example.com/only",
      sourceLabel: "Only",
      sections: [
        normalizeParsedSection({
          title: "Block",
          body: "Body",
          sequence: 1,
          level: 0,
          blockType: "paragraph",
          structuralHeadingTrail: [],
          sourceUrl: "https://example.com/only",
          sourcePageTitle: "Only Page",
        }),
      ],
      rawText: "Body",
    };

    const merged = mergeParsedSources([single]);
    expect(merged.sections[0].sourcePageTitle).toBe("Only Page");
  });
});

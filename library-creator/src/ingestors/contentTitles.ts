/** Short label for a content block — never truncates mid-word. */
export function titleFromContentLine(line: string, maxLength = 120): string {
  const cleaned = line.replace(/^[-*•]\s*/, "").trim();
  if (!cleaned) {
    return "Untitled";
  }
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const clause = cleaned.match(/^(.{8,120}?)(?:[,;]|\.|\s—|\s-\s)/);
  if (clause?.[1] && clause[1].length <= maxLength) {
    return clause[1].trim();
  }

  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > 24) {
    return truncated.slice(0, lastSpace).trim();
  }
  return truncated.trim();
}

export function defaultObjectiveTrail(pageTitle?: string): string[] {
  if (pageTitle) {
    const chapter = pageTitle.match(/ch(?:apter)?\.?\s*\d+[^|]*/i);
    if (chapter) {
      return [`${chapter[0].trim()} Objectives`];
    }
  }
  return ["Chapter Objectives"];
}

export function objectiveTrailFromIntro(
  introText: string,
  pageTitle?: string,
  headingTrail: string[] = []
): string[] {
  if (headingTrail.length > 0) {
    return [...headingTrail];
  }
  if (/chapter objectives/i.test(introText)) {
    return ["Chapter Objectives"];
  }
  if (/learning objectives/i.test(introText)) {
    return ["Learning Objectives"];
  }
  return defaultObjectiveTrail(pageTitle);
}

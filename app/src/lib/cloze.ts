export interface ClozeField {
  field_id: string;
  answer?: string;
  hint?: string;
  link_to?: string;
}

export interface ClozeData {
  template_text: string;
  cloze_fields: ClozeField[];
}

const CLOZE_TOKEN = /\[\[([^\]]+)\]\]/g;

export function getClozeFieldAnswer(
  fieldId: string,
  fieldsById: Map<string, ClozeField>
): string {
  const field = fieldsById.get(fieldId);
  if (!field) return "";
  if (field.answer) return field.answer;
  if (field.link_to) return getClozeFieldAnswer(field.link_to, fieldsById);
  return "";
}

export function buildClozeFieldMap(fields: ClozeField[]): Map<string, ClozeField> {
  return new Map(fields.map((f) => [f.field_id, f]));
}

export function splitClozeTemplate(template: string): Array<{ type: "text"; value: string } | { type: "field"; fieldId: string }> {
  const segments: Array<{ type: "text"; value: string } | { type: "field"; fieldId: string }> = [];
  let lastIndex = 0;

  for (const match of template.matchAll(CLOZE_TOKEN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: template.slice(lastIndex, index) });
    }
    segments.push({ type: "field", fieldId: match[1] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < template.length) {
    segments.push({ type: "text", value: template.slice(lastIndex) });
  }

  return segments;
}

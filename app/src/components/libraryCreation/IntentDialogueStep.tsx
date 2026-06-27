import { useMemo, useState } from "react";
import {
  buildIntentFromForm,
  searchLensCatalog,
} from "../../lib/libraryCreation/pipeline.ts";
import type { IntentDialogueForm } from "../../lib/libraryCreation/types.ts";
import type { LensCatalogEntry } from "@lc/intent/lensCatalog.js";

const AUDIENCE_OPTIONS = [
  { value: "highschool" as const, label: "High School" },
  { value: "undergrad" as const, label: "Undergraduate / College" },
  { value: "grad" as const, label: "Graduate School" },
  { value: "professional" as const, label: "Professional (Medical, Legal, Business, etc.)" },
  { value: "self_taught" as const, label: "Self-taught / Personal interest" },
];

const USAGE_OPTIONS = [
  {
    value: "exam_prep" as const,
    label: "Exam prep",
    hint: "High-yield material, practice questions, test-focused",
  },
  {
    value: "deep_understanding" as const,
    label: "Deep understanding",
    hint: "Comprehensive coverage, connections between topics",
  },
  {
    value: "reference" as const,
    label: "Quick reference",
    hint: "Lighter card load, key facts for review on the go",
  },
];

interface Props {
  initial: IntentDialogueForm;
  onNext: (form: IntentDialogueForm) => void;
}

export function IntentDialogueStep({ initial, onNext }: Props) {
  const [form, setForm] = useState<IntentDialogueForm>(initial);

  const lensMatches = useMemo(
    () => searchLensCatalog(form.lensQuery || "ABOS"),
    [form.lensQuery]
  );

  const previewTitle = form.purposeStatement.trim()
    ? buildIntentFromForm(form).libraryTitle
    : "Your library";

  function update<K extends keyof IntentDialogueForm>(key: K, value: IntentDialogueForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="panel create-step">
      <h2>What is this library for?</h2>
      <p className="step-hint">
        Talk to us like a librarian — the more specific you are, the better we can tailor your map.
      </p>

      <label className="field">
        <span className="field-label">Purpose</span>
        <textarea
          rows={3}
          value={form.purposeStatement}
          onChange={(e) => update("purposeStatement", e.target.value)}
          placeholder='e.g. "studying for USMLE Step 1," "college organic chemistry," "ABOS orthopaedic boards"'
        />
      </label>

      <fieldset className="field">
        <legend className="field-label">What level are you studying at?</legend>
        {AUDIENCE_OPTIONS.map((opt) => (
          <label key={opt.value} className="radio-row">
            <input
              type="radio"
              name="audience"
              checked={form.audienceLevel === opt.value}
              onChange={() => update("audienceLevel", opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="field">
        <legend className="field-label">Curriculum or study guide?</legend>
        <label className="radio-row">
          <input
            type="radio"
            name="curriculum"
            checked={form.curriculumMode === "custom"}
            onChange={() => update("curriculumMode", "custom")}
          />
          Yes — I have a syllabus or document
        </label>
        {form.curriculumMode === "custom" && (
          <div className="nested-fields">
            <input
              type="text"
              placeholder="Syllabus name"
              value={form.curriculumName}
              onChange={(e) => update("curriculumName", e.target.value)}
            />
            <input
              type="url"
              placeholder="Link (optional)"
              value={form.curriculumUrl}
              onChange={(e) => update("curriculumUrl", e.target.value)}
            />
          </div>
        )}
        <label className="radio-row">
          <input
            type="radio"
            name="curriculum"
            checked={form.curriculumMode === "catalog"}
            onChange={() => update("curriculumMode", "catalog")}
          />
          Yes — a well-known program or exam
        </label>
        {form.curriculumMode === "catalog" && (
          <div className="nested-fields">
            <input
              type="search"
              placeholder="Search (e.g. ABOS, Orthobullets)"
              value={form.lensQuery}
              onChange={(e) => update("lensQuery", e.target.value)}
            />
            <div className="lens-picks">
              {lensMatches.map((lens: LensCatalogEntry) => (
                <button
                  key={lens.id}
                  type="button"
                  className={
                    form.selectedLensId === lens.id ? "lens-tile selected" : "lens-tile"
                  }
                  onClick={() => {
                    update("selectedLensId", lens.id);
                    update("selectedLensName", lens.name);
                  }}
                >
                  <strong>{lens.name}</strong>
                  <span>{lens.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <label className="radio-row">
          <input
            type="radio"
            name="curriculum"
            checked={form.curriculumMode === "logical"}
            onChange={() => update("curriculumMode", "logical")}
          />
          No — organize it logically for my topic
        </label>
      </fieldset>

      <label className="field">
        <span className="field-label">Topics to include or leave out? (optional)</span>
        <textarea
          rows={2}
          value={form.scopeNotes}
          onChange={(e) => update("scopeNotes", e.target.value)}
          placeholder='e.g. "first 8 weeks only," "clinical management not basic science," "written exam not practical"'
        />
      </label>

      <fieldset className="field">
        <legend className="field-label">How will you use this library?</legend>
        {USAGE_OPTIONS.map((opt) => (
          <label key={opt.value} className="radio-row usage-row">
            <input
              type="radio"
              name="usage"
              checked={form.usagePurpose === opt.value}
              onChange={() => update("usagePurpose", opt.value)}
            />
            <span>
              <strong>{opt.label}</strong> — {opt.hint}
            </span>
          </label>
        ))}
      </fieldset>

      <p className="intent-preview">
        Working title: <em>{previewTitle}</em>
      </p>

      <div className="wizard-actions">
        <button
          type="button"
          className="btn primary"
          disabled={!form.purposeStatement.trim()}
          onClick={() => onNext(form)}
        >
          Continue to sources →
        </button>
      </div>
    </div>
  );
}

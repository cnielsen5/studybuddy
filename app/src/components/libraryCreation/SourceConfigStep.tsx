import { useMemo, useState } from "react";
import {
  buildSourceConfiguration,
  filterCatalogForDomain,
} from "../../lib/libraryCreation/pipeline.ts";
import type { LibraryCreationIntent } from "@lc/types/intent.js";
import type { CuratedSource } from "@lc/types/sourceConfig.js";
import type { SourceUpload } from "../../lib/libraryCreation/types.ts";

interface Props {
  intent: LibraryCreationIntent;
  sourceText: string;
  webUrls: string[];
  uploads: SourceUpload[];
  selectedCatalogIds: string[];
  onBack: () => void;
  onNext: (payload: {
    sourceText: string;
    webUrls: string[];
    uploads: SourceUpload[];
    selectedCatalogIds: string[];
  }) => void;
}

export function SourceConfigStep({
  intent,
  sourceText,
  webUrls,
  uploads,
  selectedCatalogIds,
  onBack,
  onNext,
}: Props) {
  const [text, setText] = useState(sourceText);
  const [urls, setUrls] = useState(webUrls.join("\n"));
  const [localUploads, setLocalUploads] = useState(uploads);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedCatalogIds));

  const catalog = useMemo(
    () => filterCatalogForDomain(intent.spineDomainId),
    [intent.spineDomainId]
  );

  const defaults = useMemo(
    () => buildSourceConfiguration(intent).selectedCatalogIds,
    [intent]
  );

  const effectiveSelected =
    selected.size > 0 ? selected : new Set(defaults);

  function toggleCatalog(id: string) {
    setSelected((prev) => {
      const base = prev.size > 0 ? prev : new Set(defaults);
      const next = new Set(base);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const added: SourceUpload[] = [...localUploads];
    for (const file of fileList) {
      added.push({
        id: `upload_${Date.now()}_${file.name}`,
        label: file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
      });
    }
    setLocalUploads(added);
  }

  return (
    <div className="panel create-step">
      <h2>Your sources</h2>
      <p className="step-hint">
        Paste notes, drop files, or skip straight to build — we pre-select recommended open
        references for your topic.
      </p>

      <label className="field">
        <span className="field-label">Paste text or markdown</span>
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste lecture notes, syllabus, or reading outline…"
        />
      </label>

      <div
        className="drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <p>Drag & drop PDF, DOCX, PPTX, or text files</p>
        <label className="btn secondary file-btn">
          Choose files
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.txt,.md"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        {localUploads.length > 0 && (
          <ul className="upload-list">
            {localUploads.map((u) => (
              <li key={u.id}>{u.label || u.fileName}</li>
            ))}
          </ul>
        )}
        {localUploads.length > 0 && (
          <p className="upload-note">
            File parsing runs in the full pipeline — paste text above for instant preview.
          </p>
        )}
      </div>

      <label className="field">
        <span className="field-label">Web URLs (one per line)</span>
        <textarea
          rows={2}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="https://…"
        />
      </label>

      <h3>Curated catalog</h3>
      <div className="catalog-grid">
        {catalog.map((item: CuratedSource) => {
          const on = effectiveSelected.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={on ? "catalog-tile selected" : "catalog-tile"}
              onClick={() => toggleCatalog(item.id)}
            >
              <span className="catalog-check">{on ? "✓" : "○"}</span>
              <strong>{item.title}</strong>
              <span>{item.publisher}</span>
              {item.recommended && <em className="recommended">recommended</em>}
            </button>
          );
        })}
      </div>

      <div className="wizard-actions">
        <button type="button" className="btn secondary" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={
            !text.trim() &&
            localUploads.length === 0 &&
            !urls.trim() &&
            effectiveSelected.size === 0
          }
          onClick={() =>
            onNext({
              sourceText: text,
              webUrls: urls.split("\n").map((u) => u.trim()).filter(Boolean),
              uploads: localUploads,
              selectedCatalogIds: [...effectiveSelected] as string[],
            })
          }
        >
          Build my library →
        </button>
      </div>
    </div>
  );
}

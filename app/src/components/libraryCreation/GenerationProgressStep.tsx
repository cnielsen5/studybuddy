import type { GenerationStep } from "../../lib/libraryCreation/types.ts";

interface Props {
  steps: GenerationStep[];
}

export function GenerationProgressStep({ steps }: Props) {
  return (
    <div className="panel create-step generation-panel">
      <h2>Building your library</h2>
      <p className="step-hint">This usually takes a moment. Grab a coffee if you pasted a lot.</p>
      <ul className="generation-steps">
        {steps.map((step) => (
          <li key={step.id} className={`gen-step gen-${step.status}`}>
            <span className="gen-icon">
              {step.status === "complete" ? "✓" : step.status === "in_progress" ? "→" : "○"}
            </span>
            <span>
              {step.label}
              {step.detail && <small>{step.detail}</small>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

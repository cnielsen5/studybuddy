import { buildIntentFromDialogue, inferDomainFromPurpose } from "../src/intent/buildIntentFromDialogue.js";
import type { IntentDialogueAnswers } from "../src/types/intentDialogue.js";

describe("buildIntentFromDialogue", () => {
  it("maps ABOS orthopaedic exam prep to clinical spine domain and lens", () => {
    const answers: IntentDialogueAnswers = {
      purposeStatement: "Preparing for the ABOS orthopaedic boards Part I basic science",
      audienceLevel: "professional",
      curriculum: {
        mode: "catalog",
        lensId: "lens_abos_orthopaedic_2025",
        lensName: "ABOS Orthopaedic Surgery Board Certification 2025",
      },
      scopeNotes: "Focus on Part I basic science, skip anatomy review",
      usagePurpose: "exam_prep",
    };

    const intent = buildIntentFromDialogue(answers);
    expect(intent.purpose).toBe("exam_prep");
    expect(intent.curriculumLensId).toBe("lens_abos_orthopaedic_2025");
    expect(intent.spineDomainId).toBe("medicine_clinical");
    expect(intent.audience.resolutionRange).toEqual({ min: 3, max: 5 });
    expect(intent.similarityThreshold).toBe(0.9);
  });

  it("infers organic chemistry domain from purpose text", () => {
    const { domain, spineDomainId } = inferDomainFromPurpose(
      "My college organic chemistry class fall semester"
    );
    expect(domain).toBe("Chemistry");
    expect(spineDomainId).toBe("chemistry");
  });
});

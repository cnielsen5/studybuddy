import { useCallback, useEffect, useState } from "react";
import type { SocratesClient } from "./socratesClient";
import type { ConceptCertificationView } from "./types";

export function useAllConceptCertifications(
  client: SocratesClient | null,
  conceptIds: string[]
) {
  const [certifications, setCertifications] = useState<
    Map<string, ConceptCertificationView>
  >(new Map());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!client || conceptIds.length === 0) {
      setCertifications(new Map());
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all(
        conceptIds.map(async (conceptId) => {
          const view = await client.getConceptCertification(conceptId);
          return [conceptId, view] as const;
        })
      );

      const next = new Map<string, ConceptCertificationView>();
      for (const [conceptId, view] of results) {
        if (view) next.set(conceptId, view);
      }
      setCertifications(next);
    } finally {
      setLoading(false);
    }
  }, [client, conceptIds]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { certifications, loading, refresh };
}

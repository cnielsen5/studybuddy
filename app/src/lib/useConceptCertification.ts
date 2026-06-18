import { useCallback, useEffect, useState } from "react";
import type { SocratesClient } from "./socratesClient";
import type { ConceptCertificationView } from "./types";

export function useConceptCertification(
  client: SocratesClient | null,
  conceptId: string | null
) {
  const [certification, setCertification] = useState<ConceptCertificationView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!client || !conceptId) {
      setCertification(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const view = await client.getConceptCertification(conceptId);
      setCertification(view);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setCertification(null);
    } finally {
      setLoading(false);
    }
  }, [client, conceptId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { certification, loading, error, refresh };
}

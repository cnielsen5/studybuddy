import { useCallback, useEffect, useState } from "react";
import type { StudyCard } from "./libraryTypes";
import { computeDeckStats, type DeckStats } from "./studyQueue";
import type { SocratesClient } from "./socratesClient";

export function useDeckStats(
  client: SocratesClient | null,
  studyCards: StudyCard[],
  libraryLoading: boolean
) {
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!client || libraryLoading) return;

    setLoading(true);
    setError(null);

    try {
      const schedules = await client.getAllCardSchedules();
      setStats(computeDeckStats(studyCards, schedules));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStats(computeDeckStats(studyCards, []));
    } finally {
      setLoading(false);
    }
  }, [client, libraryLoading, studyCards]);

  useEffect(() => {
    if (!client || libraryLoading) {
      setLoading(libraryLoading || Boolean(client));
      if (!client) setStats(null);
      return;
    }
    void refresh();
  }, [client, libraryLoading, studyCards, refresh]);

  return { stats, loading, error, refresh };
}

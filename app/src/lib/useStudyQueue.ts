import { useCallback, useEffect, useState } from "react";
import type { SocratesClient } from "./socratesClient";
import {
  buildStudyQueue,
  getStudyQueueStats,
  type QueuedStudyCard,
  type StudyQueueStats,
} from "./studyQueue";
import type { StudyCard } from "./types";

interface UseStudyQueueResult {
  queue: QueuedStudyCard[];
  stats: StudyQueueStats;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  currentCard: QueuedStudyCard | null;
  position: number;
  refresh: () => Promise<void>;
  advanceAfterReview: (cardId: string) => void;
}

export function useStudyQueue(
  client: SocratesClient | null,
  studyCards: StudyCard[],
  libraryLoading: boolean,
  conceptFilter?: string[] | null
): UseStudyQueueResult {
  const [queue, setQueue] = useState<QueuedStudyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const loadQueue = useCallback(
    async (isRefresh = false) => {
      if (!client || libraryLoading) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const schedules = await client.getAllCardSchedules();
        let built = buildStudyQueue(studyCards, schedules);
        if (conceptFilter?.length) {
          const allowed = new Set(conceptFilter);
          built = built.filter((c) => allowed.has(c.conceptId));
        }
        setQueue(built);
        setIndex((prev) => Math.min(prev, Math.max(0, built.length - 1)));
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        let fallback = buildStudyQueue(studyCards, []);
        if (conceptFilter?.length) {
          const allowed = new Set(conceptFilter);
          fallback = fallback.filter((c) => allowed.has(c.conceptId));
        }
        setQueue(fallback);
        setIndex(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [client, libraryLoading, studyCards, conceptFilter]
  );

  useEffect(() => {
    if (!client || libraryLoading) {
      setLoading(libraryLoading || !client);
      return;
    }
    void loadQueue(false);
  }, [client, libraryLoading, studyCards, conceptFilter, loadQueue]);

  const advanceAfterReview = useCallback((cardId: string) => {
    setQueue((prev) => {
      const next = prev.filter((c) => c.id !== cardId);
      setIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    });
  }, []);

  const currentCard = queue.length > 0 ? queue[index] ?? null : null;

  return {
    queue,
    stats: getStudyQueueStats(queue),
    loading,
    refreshing,
    error,
    currentCard,
    position: queue.length > 0 ? index + 1 : 0,
    refresh: () => loadQueue(true),
    advanceAfterReview,
  };
}

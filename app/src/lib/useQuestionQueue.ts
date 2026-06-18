import { useCallback, useEffect, useState } from "react";
import type { StudyQuestion } from "./libraryTypes";
import {
  buildQuestionQueue,
  getQuestionQueueStats,
  type QueuedQuestion,
} from "./questionQueue";
import type { SocratesClient } from "./socratesClient";

interface UseQuestionQueueResult {
  queue: QueuedQuestion[];
  stats: ReturnType<typeof getQuestionQueueStats>;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  currentQuestion: QueuedQuestion | null;
  position: number;
  refresh: () => Promise<void>;
  advanceAfterAttempt: (questionId: string) => void;
}

export function useQuestionQueue(
  client: SocratesClient | null,
  studyQuestions: StudyQuestion[],
  libraryLoading: boolean,
  conceptFilter?: string[] | null
): UseQuestionQueueResult {
  const [queue, setQueue] = useState<QueuedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const loadQueue = useCallback(
    async (isRefresh = false) => {
      if (!client || libraryLoading) return;

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const performances = await client.getAllQuestionPerformances();
        let built = buildQuestionQueue(studyQuestions, performances);
        if (conceptFilter?.length) {
          const allowed = new Set(conceptFilter);
          built = built.filter((q) =>
            q.conceptIds.some((id) => allowed.has(id))
          );
        }
        setQueue(built);
        setIndex((prev) => Math.min(prev, Math.max(0, built.length - 1)));
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        let fallback = buildQuestionQueue(studyQuestions, []);
        if (conceptFilter?.length) {
          const allowed = new Set(conceptFilter);
          fallback = fallback.filter((q) =>
            q.conceptIds.some((id) => allowed.has(id))
          );
        }
        setQueue(fallback);
        setIndex(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [client, libraryLoading, studyQuestions, conceptFilter]
  );

  useEffect(() => {
    if (!client || libraryLoading) {
      setLoading(libraryLoading || !client);
      return;
    }
    void loadQueue(false);
  }, [client, libraryLoading, studyQuestions, conceptFilter, loadQueue]);

  const advanceAfterAttempt = useCallback((questionId: string) => {
    setQueue((prev) => {
      const next = prev.filter((q) => q.id !== questionId);
      setIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    });
  }, []);

  const currentQuestion = queue.length > 0 ? (queue[index] ?? null) : null;

  return {
    queue,
    stats: getQuestionQueueStats(queue),
    loading,
    refreshing,
    error,
    currentQuestion,
    position: queue.length > 0 ? index + 1 : 0,
    refresh: () => loadQueue(true),
    advanceAfterAttempt,
  };
}

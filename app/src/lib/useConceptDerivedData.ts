import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import type { CardScheduleView, QuestionPerformanceView } from "./types";

export function useConceptDerivedData(libraryLoading: boolean) {
  const { client } = useAuth();
  const [schedules, setSchedules] = useState<CardScheduleView[]>([]);
  const [performances, setPerformances] = useState<QuestionPerformanceView[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!client || libraryLoading) return;
    setLoading(true);
    try {
      const [scheduleData, perfData] = await Promise.all([
        client.getAllCardSchedules(),
        client.getAllQuestionPerformances(),
      ]);
      setSchedules(scheduleData);
      setPerformances(perfData);
    } catch {
      setSchedules([]);
      setPerformances([]);
    } finally {
      setLoading(false);
    }
  }, [client, libraryLoading]);

  useEffect(() => {
    if (!client || libraryLoading) {
      setLoading(libraryLoading || Boolean(client));
      if (!client) {
        setSchedules([]);
        setPerformances([]);
      }
      return;
    }
    void refresh();
  }, [client, libraryLoading, refresh]);

  return { schedules, performances, loading, refresh };
}

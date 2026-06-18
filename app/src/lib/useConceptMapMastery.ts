import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import type { CardScheduleView } from "./types";

export function useConceptMapMastery(libraryLoading: boolean) {
  const { client } = useAuth();
  const [schedules, setSchedules] = useState<CardScheduleView[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!client || libraryLoading) return;
    setLoading(true);
    try {
      const data = await client.getAllCardSchedules();
      setSchedules(data);
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [client, libraryLoading]);

  useEffect(() => {
    if (!client || libraryLoading) {
      setLoading(libraryLoading || Boolean(client));
      if (!client) setSchedules([]);
      return;
    }
    void refresh();
  }, [client, libraryLoading, refresh]);

  return { schedules, loading, refresh };
}

"use client";

import { useState, useRef, useCallback } from "react";
import type { LogEntry, LogType, UseActivityLogReturn } from "@/types";
import { formatTime } from "@/utils/helpers";

export function useActivityLog(): UseActivityLogReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logCounter = useRef(0);

  const addLog = useCallback((message: string, type: LogType = "info") => {
    const time = formatTime();
    setLogs((prev) => [
      ...prev.slice(-49), // keep last 50
      { id: ++logCounter.current, time, message, type },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    logCounter.current = 0;
  }, []);

  return { logs, addLog, clearLogs };
}

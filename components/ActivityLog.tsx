"use client";

import { useRef } from "react";
import type { LogEntry } from "@/types";

const logTypeClass: Record<LogEntry["type"], string> = {
  info: "text-slate-400",
  success: "text-green-400",
  error: "text-red-400",
  warn: "text-yellow-400",
};

interface ActivityLogProps {
  logs: LogEntry[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  return (
    <section className="rounded-xl p-4 space-y-2 bg-pow-surface border border-pow-border">
      <p className="text-xs uppercase tracking-widest text-pow-muted">
        Activity Log
      </p>
      <div className="h-44 overflow-y-auto space-y-1 text-xs pr-1 font-mono">
        {logs.length === 0 ? (
          <p className="text-pow-muted">Awaiting events...</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex gap-2 ${logTypeClass[log.type]}`}
            >
              <span className="shrink-0 opacity-50">[{log.time}]</span>
              <span>{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

export function SystemStatus() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.ok ? "ok" : "error"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`h-2 w-2 rounded-full ${
          status === "loading"
            ? "bg-yellow-500"
            : status === "ok"
              ? "bg-green-500"
              : "bg-red-500"
        }`}
      />
      <span className="text-muted-foreground">
        System Status:{" "}
        {status === "loading"
          ? "Checking..."
          : status === "ok"
            ? "OK"
            : "Error"}
      </span>
    </div>
  );
}

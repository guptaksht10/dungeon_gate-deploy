"use client";

import { useEffect, useState } from "react";
import GlobalLock from "./GlobalLock";

export default function LockWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string | null>(null);

  const check = async () => {
    let isActive = true;

    try {
      const res = await fetch("/api/game/lock", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Bad response");
      }

      const data = await res.json();

      if (!isActive) return;

      setLocked(!!data.locked);
      setReason(data.reason || null);

    } catch (err) {
      console.error("LOCK CHECK FAILED:", err);

      if (!isActive) return;

      // Fail safe
      setLocked(false);
      setReason(null);

    } finally {
      if (isActive) setLoading(false);
    }

    return () => {
      isActive = false;
    };
  };

  useEffect(() => {
    check();
  }, []);

  if (loading) {
    return null; // or return <MinimalLoader />
  }

  if (locked) {
    return <GlobalLock reason={reason} onRetry={check} />;
  }

  return <>{children}</>;
}

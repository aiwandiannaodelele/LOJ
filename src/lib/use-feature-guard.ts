"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useFeatureGuard(key: string) {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        if (data[key] === false) router.replace("/");
      })
      .catch(() => {});
  }, [key, router]);
}

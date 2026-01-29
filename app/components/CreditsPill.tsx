"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function IconCoins() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Z" />
      <path d="M20 6v6c0 1.7-3.6 3-8 3s-8-1.3-8-3V6" />
      <path d="M20 12v6c0 1.7-3.6 3-8 3s-8-1.3-8-3v-6" />
    </svg>
  );
}

export function CreditsPill() {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/credits", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { credits?: number };
        if (!alive) return;
        setCredits(typeof json.credits === "number" ? json.credits : null);
      } catch {
        // ignore
      }
    }

    load();
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <Link href="/billing" className="credits-pill" aria-label="Credits (tap to open Billing)">
      <IconCoins />
      <span>Credits: {credits === null ? "—" : credits}</span>
    </Link>
  );
}

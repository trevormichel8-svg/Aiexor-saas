"use client";

import { useState } from "react";
import { PageCard } from "../components/PageCard";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error ?? `Request failed: ${res.status}`);
      window.location.href = (json as any).url;
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <PageCard title="Billing">
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Subscribe to refill credits automatically.
      </p>

      <button className="preset-btn" onClick={onSubscribe} disabled={loading} type="button">
        {loading ? "Redirecting…" : "Subscribe"}
      </button>

      {error && <p style={{ color: "crimson", marginTop: 10 }}>{error}</p>}
    </PageCard>
  );
}

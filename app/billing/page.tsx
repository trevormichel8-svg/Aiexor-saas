"use client";

import Link from "next/link";
import { useState } from "react";
import { PageCard } from "@/app/components/PageCard";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? `Request failed: ${res.status}`);
      window.location.href = json.url;
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <PageCard title="Billing">
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Subscribe to refill credits automatically. Your credits show in the top-right.
      </p>

      <div className="page-actions">
        <button className="pill-link" onClick={() => void onSubscribe()} disabled={loading}>
          {loading ? "Redirecting…" : "Subscribe"}
        </button>
        <Link className="pill-link" href="/studio">
          Back to Studio
        </Link>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
    </PageCard>
  );
}

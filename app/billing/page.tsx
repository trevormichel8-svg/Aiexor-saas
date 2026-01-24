"use client";

import { useState } from "react";

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
    <main>
      <h2>Billing</h2>
      <p style={{ opacity: 0.8 }}>
        This creates a Stripe Checkout subscription. Webhook refills credits on invoice paid.
      </p>

      <button onClick={onSubscribe} disabled={loading}>
        {loading ? "Redirecting..." : "Subscribe"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <p style={{ marginTop: 12 }}>
        <a href="/studio">Back to Studio</a>
      </p>
    </main>
  );
}

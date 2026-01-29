"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageCard from "../components/PageCard";

type HistoryItem = {
  id: string;
  prompt: string;
  provider: string;
  createdAt: string;
  image: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/history", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load history");

      const mapped: HistoryItem[] = (data.items ?? []).map((it: any) => ({
        id: String(it.id),
        prompt: String(it.prompt ?? ""),
        provider: String(it.provider ?? ""),
        createdAt: String(it.createdAt ?? new Date().toISOString()),
        image: String((it.image ?? it.images?.[0] ?? "")),
      }));
      setItems(mapped);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const del = async (id: string) => {
    const prev = items;
    setItems((p) => p.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/history`, { method: "DELETE", headers: {"content-type":"application/json"}, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      setItems(prev);
    }
  };

  const download = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "aiexor.png";
    a.rel = "noreferrer";
    a.click();
  };

  const remix = (prompt: string) => {
    try {
      localStorage.setItem("aiexor.remixPrompt", prompt);
    } catch {}
  };

  return (
    <div className="studio-page">
      <div className="history-header">
        <div>
          <div className="history-title">History</div>
          <div className="muted">Your saved generations.</div>
        </div>
        <div className="history-actions">
          <Link href="/studio" className="btn btn-primary">
            Back to Studio
          </Link>
          <button type="button" className="btn" onClick={load} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="error-pill" role="alert">
          {error}
        </div>
      ) : null}

      {busy ? <div className="muted">Loading…</div> : null}

      <div className="outputs">
        {items.length === 0 && !busy ? (
          <PageCard title="No history yet">
            <p className="muted">Generate something in Studio and it will show up here.</p>
          </PageCard>
        ) : null}

        {items.map((it) => (
          <PageCard key={it.id} title={it.prompt ? it.prompt.slice(0, 42) + (it.prompt.length > 42 ? "…" : "") : "Untitled"}>
            <div className="image-stack">
              {[it.image].filter(Boolean).map((u) => (
                <div className="gen-card" key={u}>
                  <img className="gen-image" src={u} alt={it.prompt} loading="lazy" />
                  <div className="gen-actions">
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => {
                        remix(it.prompt);
                        // go to studio
                        window.location.href = "/studio";
                      }}
                    >
                      <IconRemix />
                      <span>Remix</span>
                    </button>

                    <button type="button" className="action-btn" onClick={() => download(u)}>
                      <IconDownload />
                      <span>Download</span>
                    </button>

                    <button type="button" className="action-btn danger" onClick={() => del(it.id)}>
                      <IconTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="meta-row">
              <span className="meta-chip">{it.provider}</span>
              <span className="meta-chip">{new Date(it.createdAt).toLocaleString()}</span>
            </div>
          </PageCard>
        ))}
      </div>
    </div>
  );
}

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v10m0 0 4-4m-4 4-4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 17v3h16v-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconRemix() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7h10v10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7l1 14h10l1-14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7V4h6v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

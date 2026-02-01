"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Provider = "openai" | "vertex";
type Tab = "studio" | "history";

type OutputCard = {
  key: string;
  historyId?: string;
  prompt: string;
  provider: Provider;
  imageUrl?: string;
  status: "loading" | "ready" | "error";
  message?: string;
  createdAt?: string;
};

type HistoryItem = {
  id: string;
  prompt: string;
  provider: Provider | string;
  image: string;
  createdAt: string;
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 16h10l1-16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v10" />
      <path d="M8 11l4 4 4-4" />
      <path d="M4 21h16" />
    </svg>
  );
}

function LikeIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7-4.35-9.2-8.35C1.1 9.4 3 6.5 6.1 6.1c1.7-.2 3.2.6 3.9 1.8.7-1.2 2.2-2 3.9-1.8 3.1.4 5 3.3 3.3 6.5C19 16.65 12 21 12 21z" />
    </svg>
  );
}

function RemixIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return "";
  }
}

export default function StudioPage() {
  const [tab, setTab] = useState<Tab>("studio");
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("Default");
  const [provider, setProvider] = useState<Provider>("openai");
  const [styleOpen, setStyleOpen] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [cards, setCards] = useState<OutputCard[]>([]);
  const [busy, setBusy] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);

  const outputRef = useRef<HTMLDivElement | null>(null);

  function scrollToTop() {
    const el = outputRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }

  const styles = useMemo(
    () => [
      "Abstract","Impressionism","Cubism","Futurism","Surrealism","Expressionism","Baroque","Renaissance",
      "Pop Art","Art Deco","Minimalism","Modernism","Bauhaus","Dadaism","Conceptual","Street Art",
      "Graffiti","Anime","Manga","Pixel Art","8-bit","Steampunk","Cyberpunk","Fantasy","Sci-Fi",
      "Noir","Gothic","Nature","Wildlife","Portrait","Landscape","Seascape","Cityscape","Caricature",
      "Watercolor","Oil Painting","Acrylic","Ink Drawing","Charcoal","Pastel","Geometric","Kawaii","Retro",
      "Vintage","Psychedelic","Horror","Stencil","Indigenous","Coloring Book","Comic","Photo Realistic","Highly Detailed",
      "Silhouette","Mosaic","Realistic Anime","Vibrant","Epic Origami","Abstract Curves","CGI","Black&White","3D Shading",
      "Quilling","Candy","Double Exposure","Kintsugi","Glass","Movie Poster","Filigree","Fractal","Holographic","Golder Ratio",
      "Iridescent","Topography","Silver Nitrate","Embossed","Embroidery"
    ],
    [],
  );

  async function generate() {
    if (!prompt.trim() || busy) return;

    const key = uid();
    const card: OutputCard = {
      key,
      prompt: prompt.trim(),
      provider,
      status: "loading",
    };

    setBusy(true);
    setCards((cur) => [card, ...cur]);
    scrollToTop();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: card.prompt,
          style: selectedStyle,
          provider,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Generate failed");
      }

      const data = (await res.json()) as { imageUrl?: string; id?: string; createdAt?: string };
      setCards((cur) =>
        cur.map((c) =>
          c.key === key
            ? {
                ...c,
                status: "ready",
                imageUrl: data.imageUrl,
                historyId: data.id,
                createdAt: data.createdAt,
              }
            : c,
        ),
      );

      setPrompt("");
    } catch (e: any) {
      setCards((cur) =>
        cur.map((c) => (c.key === key ? { ...c, status: "error", message: String(e?.message || e) } : c)),
      );
    } finally {
      setBusy(false);
    }
  }

  async function loadHistory() {
    if (historyBusy) return;
    setHistoryBusy(true);
    try {
      const res = await fetch("/api/history", { method: "GET" });
      if (!res.ok) throw new Error(await res.text());
      const items = (await res.json()) as HistoryItem[];

      const mapped: OutputCard[] = items.map((it) => ({
        key: `h_${it.id}`,
        historyId: it.id,
        prompt: it.prompt,
        provider: (it.provider === "vertex" ? "vertex" : "openai") as Provider,
        imageUrl: it.image,
        status: "ready",
        createdAt: it.createdAt,
      }));

      setCards(mapped);
      scrollToTop();
    } catch {
      // ignore
    } finally {
      setHistoryBusy(false);
    }
  }

  async function deleteHistoryItem(historyId?: string) {
    if (!historyId) return;
    try {
      await fetch(`/api/history/${encodeURIComponent(historyId)}`, { method: "DELETE" });
      setCards((cur) => cur.filter((c) => c.historyId !== historyId));
    } catch {
      // ignore
    }
  }

  function downloadImage(url?: string) {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "aiexor.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function remixPrompt(p: string) {
    setTab("studio");
    setPrompt(p);
    scrollToTop();
  }

  useEffect(() => {
    if (tab === "history") loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="studio-page">
      <div className="studio-header">
        <div className="studio-tabs">
          <button type="button" className={`tab-pill ${tab === "studio" ? "active" : ""}`} onClick={() => setTab("studio")}>
            Studio
          </button>
          <button type="button" className={`tab-pill ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
            History
          </button>
        </div>

        <div className="studio-toolbar">
          <div className="provider-toggle">
            <button type="button" className={`provider-btn ${provider === "openai" ? "active" : ""}`} onClick={() => setProvider("openai")}>
              OpenAI
            </button>
            <button type="button" className={`provider-btn ${provider === "vertex" ? "active" : ""}`} onClick={() => setProvider("vertex")}>
              Vertex
            </button>
          </div>

          <button type="button" className="style-btn" onClick={() => setStyleOpen((v) => !v)}>
            Style
          </button>
        </div>
      </div>

      {styleOpen ? (
        <div className="style-popover">
          <div className="style-grid">
            {styles.map((s) => (
              <button
                key={s}
                type="button"
                className={`style-item ${selectedStyle === s ? "active" : ""}`}
                onClick={() => {
                  setSelectedStyle(s);
                  setStyleOpen(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="studio-main" ref={outputRef}>
        {tab === "studio" ? (
          <div className="studio-canvas">
            {cards.length === 0 ? <div className="empty-state">Describe an image to generate.</div> : null}

            <div className="cards">
              {cards.map((c) => (
                <div key={c.key} className={`card ${c.status}`}>
                  <div className="card-meta">
                    <div className="card-prompt">{c.prompt}</div>
                    <div className="card-sub">
                      <span className="badge">{c.provider}</span>
                      {c.createdAt ? <span className="date">{formatDate(c.createdAt)}</span> : null}
                    </div>
                  </div>

                  {c.status === "loading" ? <div className="loading">Generating…</div> : null}
                  {c.status === "error" ? <div className="error">{c.message || "Error"}</div> : null}

                  {c.status === "ready" && c.imageUrl ? (
                    <div className="image-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.imageUrl} alt={c.prompt} className="generated-image" />

                      <div className="image-controls">
                        <button type="button" className="image-remix-btn" onClick={() => remixPrompt(c.prompt)} disabled={c.status === "loading"}>
                          <RemixIcon />
                        </button>

                        <button type="button" className="image-download-btn" onClick={() => downloadImage(c.imageUrl)} disabled={c.status === "loading"}>
                          <DownloadIcon />
                        </button>

                        <button
                          type="button"
                          className={`image-like-btn ${liked[c.key] ? "active" : ""}`}
                          aria-label="Like image"
                          onClick={() => setLiked((cur) => ({ ...cur, [c.key]: !cur[c.key] }))}
                          disabled={c.status === "loading"}
                        >
                          <LikeIcon filled={!!liked[c.key]} className="icon" />
                        </button>

                        {c.historyId ? (
                          <button type="button" className="image-delete-btn" onClick={() => deleteHistoryItem(c.historyId)} aria-label="Delete from history">
                            <IconTrash />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="history-canvas">
            <div className="history-head">
              <div className="history-title">History</div>
              <button type="button" className="history-refresh" onClick={loadHistory} disabled={historyBusy}>
                {historyBusy ? "Loading…" : "Refresh"}
              </button>
            </div>

            {cards.length === 0 ? <div className="empty-state">No history yet.</div> : null}

            <div className="cards">
              {cards.map((c) => (
                <div key={c.key} className={`card ${c.status}`}>
                  <div className="card-meta">
                    <div className="card-prompt">{c.prompt}</div>
                    <div className="card-sub">
                      <span className="badge">{c.provider}</span>
                      {c.createdAt ? <span className="date">{formatDate(c.createdAt)}</span> : null}
                    </div>
                  </div>

                  {c.imageUrl ? (
                    <div className="image-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.imageUrl} alt={c.prompt} className="generated-image" />

                      <div className="image-controls">
                        <button type="button" className="image-remix-btn" onClick={() => remixPrompt(c.prompt)}>
                          <RemixIcon />
                        </button>

                        <button type="button" className="image-download-btn" onClick={() => downloadImage(c.imageUrl)}>
                          <DownloadIcon />
                        </button>

                        <button
                          type="button"
                          className={`image-like-btn ${liked[c.key] ? "active" : ""}`}
                          aria-label="Like image"
                          onClick={() => setLiked((cur) => ({ ...cur, [c.key]: !cur[c.key] }))}
                        >
                          <LikeIcon filled={!!liked[c.key]} className="icon" />
                        </button>

                        {c.historyId ? (
                          <button type="button" className="image-delete-btn" onClick={() => deleteHistoryItem(c.historyId)} aria-label="Delete from history">
                            <IconTrash />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="prompt-container">
        <textarea
          className="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your image…"
          rows={1}
        />
        <button type="button" className="generate-btn" onClick={generate} disabled={busy || !prompt.trim()}>
          Generate
        </button>
      </div>
    </div>
  );
}

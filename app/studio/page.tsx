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
      <path d="M10 11v7" />
      <path d="M14 11v7" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v12" />
      <polyline points="5 13 12 20 19 13" />
      <path d="M5 19h14" />
    </svg>
  );
}
function RemixIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.13-3.36l5.36 5.36" />
      <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 13" />
    </svg>
  );
}
function BrushIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3l7 7-9 9H5v-7l9-9z" />
      <path d="M12 5l7 7" />
    </svg>
  );
}
function GenerateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="14" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function LoadingLoop() {
  return (
    <div className="loading-loop" aria-label="Generating">
      <div className="loading-ring" />
      <div className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function StudioPage() {
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
    []
  );

  const [tab, setTab] = useState<Tab>("studio");
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [styleOpen, setStyleOpen] = useState(false);

useEffect(() => {
  if (!styleOpen) return;
  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = prev;
  };
}, [styleOpen]);

  const [cards, setCards] = useState<OutputCard[]>([]);
  const [busy, setBusy] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);

  const outputRef = useRef<HTMLDivElement | null>(null);

  function scrollToTop() {
    const el = outputRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }

  async function fetchHistory() {
    try {
      setHistoryBusy(true);
      const res = await fetch("/api/history", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { items?: HistoryItem[] };
      const items = Array.isArray(json.items) ? json.items : [];
      setCards(
        items.map((g) => ({
          key: g.id,
          historyId: g.id,
          prompt: g.prompt,
          provider: (g.provider === "vertex" ? "vertex" : "openai") as Provider,
          imageUrl: g.image,
          status: "ready",
          createdAt: g.createdAt,
        }))
      );
      queueMicrotask(scrollToTop);
    } finally {
      setHistoryBusy(false);
    }
  }

  useEffect(() => {
    void fetchHistory();
  }, []);

  async function callGenerate(p: string, prov: Provider) {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: p,
        provider: prov,
        aspectRatio: "1:1",
        sampleCount: 1,
        personGeneration: "allow_none",
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error ?? `Request failed: ${res.status}`);

    const images: string[] = Array.isArray(json?.images)
      ? json.images
      : Array.isArray(json?.output)
        ? json.output
        : json?.image
          ? [json.image]
          : [];

    if (images.length === 0) throw new Error("No image returned");
    return { images, generationId: json?.generationId as string | undefined };
  }

  async function generateNew(p: string, prov: Provider) {
    const clean = p.trim();
    if (!clean) return;

    setBusy(true);

    const key = uid();
    setCards((prev) => [
      { key, prompt: clean, provider: prov, status: "loading" },
      ...prev,
    ]);
    queueMicrotask(scrollToTop);

    try {
      const { images, generationId } = await callGenerate(clean, prov);
      const first = images[0]!;
      setCards((prev) =>
        prev.map((c) =>
          c.key === key
            ? { ...c, imageUrl: first, status: "ready", historyId: generationId ?? c.historyId }
            : c
        )
      );
      setPrompt("");
      setStyleOpen(false);
      setTab("studio");
    } catch (e: any) {
      setCards((prev) =>
        prev.map((c) =>
          c.key === key ? { ...c, status: "error", message: e?.message ?? "Failed to generate" } : c
        )
      );
    } finally {
      setBusy(false);
    }
  }

  async function remix(cardKey: string) {
    const card = cards.find((c) => c.key === cardKey);
    if (!card) return;

    setTab("studio");
    void generateNew(card.prompt, provider);
  }

  function download(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function deleteOne(card: OutputCard) {
    if (!card.historyId) return;
    setHistoryBusy(true);
    try {
      await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.historyId }),
      });
      setCards((prev) => prev.filter((c) => c.historyId !== card.historyId));
    } finally {
      setHistoryBusy(false);
    }
  }

  async function clearAll() {
    setHistoryBusy(true);
    try {
      await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setCards([]);
    } finally {
      setHistoryBusy(false);
    }
  }

  const emptyVisible = cards.length === 0 && tab === "studio";

  return (
    <>
      <div className="studio-tabs">
        <button
          type="button"
          className={`tab-btn ${tab === "studio" ? "active" : ""}`}
          onClick={() => setTab("studio")}
        >
          Studio
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === "history" ? "active" : ""}`}
          onClick={() => setTab("history")}
        >
          History
        </button>

        <div className="tabs-spacer" />

        {tab === "history" ? (
          <button type="button" className="tab-btn danger" onClick={() => void clearAll()} disabled={historyBusy}>
            Clear all
          </button>
        ) : null}
      </div>

      {emptyVisible ? (
        <div id="empty-state" className="empty-state">
          <h1 className="first-message">Generate Your First Image</h1>
          <div className="preset-prompts">
            {["Sunset over ocean", "Cute robot in forest", "Futuristic city skyline", "Dragon flying over mountains"].map((p) => (
              <button
                key={p}
                type="button"
                className="preset-btn"
                onClick={() => void generateNew(p, provider)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div id="output" className="output" ref={outputRef}>
        <div className="output-grid">
          {tab === "history" && historyBusy ? (
            <div className="history-loading">
              <LoadingLoop />
            </div>
          ) : null}

          {tab === "history" && cards.length === 0 ? (
            <div className="history-empty">
              <p className="loading">No history yet.</p>
            </div>
          ) : null}

          {cards.map((c) => (
            <div key={c.key} className="image-container" data-prompt={c.prompt}>
              {c.status === "loading" ? (
                <LoadingLoop />
              ) : c.status === "error" ? (
                <p className="loading">{c.message ?? "Failed to generate image"}</p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt="Generated image" />
              )}

              {tab === "history" && c.status === "ready" ? (
                <div className="prompt-chip" title={c.prompt}>
                  {c.prompt}
                </div>
              ) : null}

              <div className="image-controls">
                <button
                  type="button"
                  className="image-remix-btn"
                  aria-label="Remix image"
                  onClick={() => remix(c.key)}
                  disabled={c.status === "loading"}
                >
                  <RemixIcon />
                </button>

                <button
                  type="button"
                  className="image-download-btn"
                  aria-label="Download image"
                  onClick={() => c.imageUrl && download(c.imageUrl)}
                  disabled={!c.imageUrl || c.status === "loading"}
                >
                  <DownloadIcon />
                </button>

                {tab === "history" ? (
                  <button
                    type="button"
                    className="image-delete-btn"
                    aria-label="Delete from history"
                    onClick={() => void deleteOne(c)}
                    disabled={historyBusy || !c.historyId}
                  >
                    <IconTrash />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      
      <div className={`sheet-backdrop ${styleOpen ? "open" : ""}`} onClick={() => setStyleOpen(false)} />
<div id="style-menu" role="dialog" aria-modal="true" aria-label="Tools" className={`style-menu ${styleOpen ? "open" : ""}`}>
        <div className="sheet-handle" aria-hidden="true" />

        <div className="style-menu-header">
          <div className="style-menu-title">Styles</div>
          <button type="button" className="icon-button" aria-label="Close styles" onClick={() => setStyleOpen(false)}>
            ✕
          </button>
        </div>
        <div className="style-menu-grid">
          {styles.map((s) => (
            <button
              key={s}
              type="button"
              className="style-pill"
              onClick={() => {
                setPrompt((cur) => {
                  const t = cur.trim();
                  return t ? `${t}, ${s}` : s;
                });
                setStyleOpen(false);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <form
        className="prompt-container"
        id="prompt-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          void generateNew(prompt, provider);
        }}
      >
        <button
          type="button"
          className="plus-btn"
          id="style-btn"
          aria-label="Choose style"
          onClick={() => setStyleOpen((v) => !v)}
        >
          <BrushIcon />
        </button>

        <select
          id="provider-select"
          className="provider-select"
          aria-label="Image model provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value as Provider)}
        >
          <option value="openai">OpenAI</option>
          <option value="vertex">Vertex AI</option>
        </select>

        <textarea
          id="prompt-input"
          className="prompt-input"
          placeholder="Describe your image"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setStyleOpen(false)}
        />

        <button
          type="submit"
          className="icon-button generate-btn"
          id="generate-btn"
          aria-label="Generate image"
          disabled={busy}
        >
          <GenerateIcon />
        </button>
      </form>
    </>
  );
}

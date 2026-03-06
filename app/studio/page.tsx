"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useProvider, type ProviderId, type ModelId } from "../providers/provider-context";

type OutputCard = {
  key: string;
  historyId?: string;
  prompt: string;
  provider: ProviderId;
  imageUrl?: string;
  status: "loading" | "ready" | "error";
  message?: string;
  createdAt?: string;
};

type HistoryItem = {
  id: string;
  prompt: string;
  provider: ProviderId | string;
  image: string;
  createdAt: string;
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function BrushIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3l7 7-9 9H5v-7l9-9z" />
      <path d="M12 5l7 7" />
    </svg>
  );
}

function GenerateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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

function ClickIcon({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled ? "true" : "false"}
      title={label}
      onClick={() => {
        if (!disabled) onClick();
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <i className={`bi ${icon}`} aria-hidden="true" />
    </span>
  );
}

export default function StudioPage() {
  const styles = useMemo(
    () => [
      "Abstract",
      "Impressionism",
      "Cubism",
      "Futurism",
      "Surrealism",
      "Expressionism",
      "Baroque",
      "Renaissance",
      "Pop Art",
      "Art Deco",
      "Minimalism",
      "Modernism",
      "Bauhaus",
      "Dadaism",
      "Conceptual",
      "Street Art",
      "Graffiti",
      "Anime",
      "Manga",
      "Pixel Art",
      "8-bit",
      "Steampunk",
      "Cyberpunk",
      "Fantasy",
      "Sci-Fi",
      "Noir",
      "Gothic",
      "Nature",
      "Wildlife",
      "Portrait",
      "Landscape",
      "Seascape",
      "Cityscape",
      "Caricature",
      "Watercolor",
      "Oil Painting",
      "Acrylic",
      "Ink Drawing",
      "Charcoal",
      "Pastel",
      "Geometric",
      "Kawaii",
      "Retro",
      "Vintage",
      "Psychedelic",
      "Horror",
      "Stencil",
      "Indigenous",
      "Coloring Book",
      "Comic",
      "Photo Realistic",
      "Highly Detailed",
      "Silhouette",
      "Mosaic",
      "Realistic Anime",
      "Vibrant",
      "Epic Origami",
      "Abstract Curves",
      "CGI",
      "Black&White",
      "3D Shading",
      "Quilling",
      "Candy",
      "Double Exposure",
      "Kintsugi",
      "Glass",
      "Movie Poster",
      "Filigree",
      "Fractal",
      "Holographic",
      "Golden Ratio",
      "Iridescent",
      "Topography",
      "Silver Nitrate",
      "Embossed",
      "Embroidery",
      "Smoke",
      "Cloud",
      "Chibi",
      "Disney",
      "Doodle",
      "Airbrush",
      "Glitchcore",
      "Cinematic",
    ],
    []
  );

  const [tab, setTab] = useState("studio");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3" | "3:4">("1:1");
  const [compareOpen, setCompareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCardKey, setEditCardKey] = useState<string | null>(null);


  const { provider, model } = useProvider();

  const [styleOpen, setStyleOpen] = useState(false);
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
          provider: (g.provider === "vertex" ? "vertex" : "openai") as ProviderId,
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

  async function callGenerate(p: string, prov: ProviderId, mdl: ModelId) {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: p, provider: prov, model: mdl }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error ?? `Request failed: ${res.status}`);

    const images: string[] = Array.isArray(json?.images)
      ? json.images
          .map((x: any) =>
            typeof x === "string" ? x : x?.b64 ? `data:image/png;base64,${x.b64}` : null
          )
          .filter(Boolean)
      : Array.isArray(json?.output)
      ? json.output
      : json?.image
      ? [json.image]
      : [];

    if (images.length === 0) throw new Error("No image returned");
    return { images, generationId: json?.generationId as string | undefined };
  }

  
  async function variations(cardKey: string) {
    const card = cards.find((c) => c.key === cardKey);
    if (!card) return;

    setBusy(true);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: card.prompt,
          provider: card.provider,
          model,
          aspectRatio,
          n: 4,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? `Request failed: ${res.status}`);

      const images: string[] = Array.isArray(json?.images)
        ? json.images
            .map((x: any) => (typeof x === "string" ? x : x?.b64 ? `data:image/png;base64,${x.b64}` : null))
            .filter(Boolean)
        : [];

      if (!images.length) throw new Error("No images returned");

      const now = Date.now();
      setCards((prev) => [
        ...images.map((url, idx) => ({
          key: `${now}_${idx}_${Math.random().toString(16).slice(2)}`,
          prompt: card.prompt,
          provider: card.provider,
          imageUrl: url,
          status: "ready" as const,
        })),
        ...prev,
      ]);
      queueMicrotask(scrollToTop);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  function openEdit(cardKey: string) {
    setEditCardKey(cardKey);
    setEditOpen(true);
  }

async function generateNew(p: string) {
    const clean = p.trim();
    if (!clean) return;

    setBusy(true);

    const key = uid();
    setCards((prev) => [{ key, prompt: clean, provider, status: "loading" }, ...prev]);
    queueMicrotask(scrollToTop);

    try {
      const { images, generationId } = await callGenerate(clean, provider, model);
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
    void generateNew(card.prompt);
  }

  function download(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function publishToGallery(card: OutputCard) {
    if (!card.imageUrl) return;

    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: card.prompt,
        imageUrl: card.imageUrl,
        provider: card.provider,
        model,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error ?? "Publish failed");
    }
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

  const emptyVisible = cards.length === 0 && tab === "studio";

  return (
    <>
      <div className="studio-top">
        <div className="ratio-row">
          {["1:1", "16:9", "9:16", "4:3", "3:4"].map((r) => (
            <button key={r} type="button" className={`pill-btn ${aspectRatio === r ? "active" : ""}`} onClick={() => setAspectRatio(r as any)}>
              {r}
            </button>
          ))}
          <button type="button" className="pill-btn" onClick={() => setCompareOpen(true)}>
            <i className="bi bi-grid-3x3-gap" aria-hidden="true"></i><span>Compare</span>
          </button>
        </div>

        <div className="preset-row">
          {[
            { label: "Anime", add: "anime, clean line art, vibrant" },
            { label: "Cyberpunk", add: "cyberpunk, neon, rainy, cinematic" },
            { label: "Oil", add: "oil painting, textured brush strokes" },
            { label: "Photo", add: "photorealistic, DSLR, shallow depth of field" },
            { label: "3D", add: "3d render, octane render, global illumination" },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              className="pill-btn"
              onClick={() =>
                setPrompt((cur) => {
                  const t = cur.trim();
                  return t ? `${t}, ${p.add}` : p.add;
                })
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {emptyVisible ? (
        <div id="empty-state" className="empty-state">
          <h1 className="first-message">Generate Your First Image</h1>
          <div className="preset-prompts">
            {["Sunset over ocean", "Cute robot in forest", "Futuristic city skyline", "Dragon flying over mountains"].map(
              (p) => (
                <button key={p} type="button" className="preset-btn" onClick={() => void generateNew(p)}>
                  {p}
                </button>
              )
            )}
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

              {/* Bootstrap Icons — no buttons, icons remain clickable */}
              <div className="image-controls" style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <ClickIcon
                  icon="bi-arrow-repeat"
                  label="Remix image"
                  onClick={() => remix(c.key)}
                  disabled={c.status === "loading"}
                />

                <ClickIcon
                  icon="bi-download"
                  label="Download image"
                  onClick={() => c.imageUrl && download(c.imageUrl)}
                  disabled={!c.imageUrl || c.status === "loading"}
                />

                <ClickIcon
                  icon="bi-upload"
                  label="Publish to gallery"
                  onClick={() => void publishToGallery(c)}
                  disabled={!c.imageUrl || c.status === "loading"}
                />

                {tab === "history" ? (
                  <ClickIcon
                    icon="bi-trash"
                    label="Delete from history"
                    onClick={() => void deleteOne(c)}
                    disabled={historyBusy || !c.historyId}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="style-menu" className={`style-menu ${styleOpen ? "open" : ""}`}>
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
          void generateNew(prompt);
        }}
      >
        <button
          type="button"
          className="plus-btn"
          id="style-btn"
          aria-label="Choose style"
          onClick={() => setStyleOpen((v) => !v)}
        >
          <i className="bi bi-brush" aria-hidden="true" />
        </button>

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
          <i className="bi bi-stars" aria-hidden="true" />
        </button>
      </form>

      {compareOpen ? (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-inner">
            <div className="modal-head">
              <div className="modal-title">Model Comparison</div>
              <button type="button" className="icon-button" aria-label="Close" onClick={() => setCompareOpen(false)}>
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              <p className="loading">
                Scaffold only (won't break builds). Next: choose multiple providers/models and call /api/image.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {editOpen ? (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-inner">
            <div className="modal-head">
              <div className="modal-title">Edit (Inpaint)</div>
              <button type="button" className="icon-button" aria-label="Close" onClick={() => setEditOpen(false)}>
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              <p className="loading">
                Scaffold only: add a mask canvas (fabric.js/konva) and POST baseImage+mask+prompt to /api/image.
              </p>
              {editCardKey ? (
                (() => {
                  const card = cards.find((x) => x.key === editCardKey);
                  return card?.imageUrl ? <img src={card.imageUrl} alt="Edit base" style={{ width: "100%", borderRadius: 16 }} /> : null;
                })()
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

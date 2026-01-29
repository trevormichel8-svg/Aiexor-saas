"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageCard } from "../components/PageCard";

type Provider = "openai" | "vertex";
type GenImage = { url: string };
type Card = {
  id: string;
  prompt: string;
  provider: Provider;
  createdAt: string;
  images: GenImage[];
};

const PROMPT_SUGGESTIONS = [
  "highly detailed, sharp focus, cinematic lighting",
  "soft studio light, shallow depth of field",
  "ultra realistic, 8k, intricate textures",
  "vibrant colors, clean composition, centered subject",
  "add dramatic rim light and volumetric fog",
];

export default function StudioPage() {
  const searchParams = useSearchParams();

  const provider = (searchParams?.get("provider") ?? "openai") as Provider;
  const aspectRatio = searchParams?.get("ar") ?? "1:1";
  const sampleCount = clampInt(searchParams?.get("samples"), 1, 1, 4);
  const negativePrompt = searchParams?.get("neg") ?? "";
  const personGeneration = searchParams?.get("people") ?? "allow_adult";

  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [styleOpen, setStyleOpen] = useState(false);
  const [assistOpen, setAssistOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // keep last session outputs (nice on refresh)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("aiexor.session.cards");
      if (raw) setCards(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      const remix = localStorage.getItem("aiexor.remixPrompt");
      if (remix) {
        setPrompt(remix);
        localStorage.removeItem("aiexor.remixPrompt");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("aiexor.session.cards", JSON.stringify(cards.slice(0, 10)));
    } catch {}
  }, [cards]);

  const styles = useMemo(
    () => [
      "Neon glass, cyber glow",
      "Minimal studio, clean shadows",
      "Anime, crisp linework",
      "3D render, soft GI",
      "Film photo, grain",
      "Watercolor, textured paper",
      "Isometric, vector",
      "Vintage poster, halftone",
    ],
    []
  );

  const generateNew = async () => {
    const text = prompt.trim();
    if (!text || busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          provider,
          aspectRatio,
          sampleCount,
          negativePrompt,
          personGeneration,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed");

      const createdAt = new Date().toISOString();
      const newCard: Card = {
        id: String(data.generationId ?? crypto.randomUUID()),
        prompt: text,
        provider,
        createdAt,
        images: (data.images ?? []).map((u: string) => ({ url: u })),
      };

      setCards((prev) => [newCard, ...prev].slice(0, 10));
      setPrompt(""); // reset input after success
      inputRef.current?.focus();
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="studio-page">
      <div className="studio-grid">
        <section className="canvas">
          {error ? (
            <div className="error-pill" role="alert">
              {error}
            </div>
          ) : null}

          {busy ? (
            <div className="loading-loop" aria-label="Generating">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
          ) : null}

          <div className="outputs">
            {cards.length === 0 ? (
              <PageCard title="Create your first image">
                <p className="muted">
                  Type a prompt below, pick a style if you want, then hit Generate.
                </p>
              </PageCard>
            ) : null}

            {cards.map((c) => (
              <PageCard key={c.id} title={formatTitle(c.prompt)}>
                <div className="image-stack">
                  {c.images.map((img) => (
                    <GenerationCard
                      key={img.url}
                      id={c.id}
                      imageUrl={img.url}
                      prompt={c.prompt}
                      onRemix={() => setPrompt(c.prompt)}
                      onDelete={() => setCards((prev) => prev.filter((x) => x.id !== c.id))}
                    />
                  ))}
                </div>
                <div className="meta-row">
                  <span className="meta-chip">{c.provider === "vertex" ? "Vertex" : "OpenAI"}</span>
                  <span className="meta-chip">{timeAgo(c.createdAt)}</span>
                </div>
              </PageCard>
            ))}
          </div>

          {/* Prompt & actions */}
          <form
            className="prompt-bar"
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              void generateNew();
            }}
          >
            <button
              type="button"
              className="plus-btn"
              aria-label="Open styles"
              onClick={() => setStyleOpen(true)}
            >
              <IconSpark />
            </button>

            <textarea
              ref={inputRef}
              className="prompt-input"
              placeholder="Describe your image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={1}
            />

            <button
              type="button"
              className="icon-button icon-button--circle"
              aria-label="Prompt assist"
              onClick={() => setAssistOpen((v) => !v)}
            >
              <IconWand />
            </button>

            <button className="generate-btn" disabled={busy || !prompt.trim()} type="submit">
              <span>Generate</span>
              <IconArrow />
            </button>
          </form>

          {/* Assist popover */}
          {assistOpen ? (
            <div className="assist-pop" role="dialog" aria-label="Prompt assistance">
              <div className="assist-title">Prompt assistance</div>
              {PROMPT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="assist-item"
                  onClick={() => {
                    setPrompt((cur) => {
                      const t = cur.trim();
                      return t ? `${t}, ${s}` : s;
                    });
                    setAssistOpen(false);
                    inputRef.current?.focus();
                  }}
                >
                  {s}
                </button>
              ))}
              <button type="button" className="assist-close" onClick={() => setAssistOpen(false)}>
                Close
              </button>
            </div>
          ) : null}
        </section>

        {/* Style drawer */}
        <div className={`style-menu ${styleOpen ? "open" : ""}`}>
          <div className="style-menu-header">
            <div className="style-menu-title">Styles</div>
            <button
              type="button"
              className="icon-button icon-button--circle"
              aria-label="Close styles"
              onClick={() => setStyleOpen(false)}
            >
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
                  inputRef.current?.focus();
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerationCard({
  id,
  imageUrl,
  prompt,
  onRemix,
  onDelete,
}: {
  id: string;
  imageUrl: string;
  prompt: string;
  onRemix: () => void;
  onDelete: () => void;
}) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aiexor.likes");
      if (!raw) return;
      const set = new Set<string>(JSON.parse(raw));
      setLiked(set.has(id));
    } catch {}
  }, [id]);

  const toggleLike = () => {
    try {
      const raw = localStorage.getItem("aiexor.likes");
      const set = new Set<string>(raw ? JSON.parse(raw) : []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      localStorage.setItem("aiexor.likes", JSON.stringify(Array.from(set)));
      setLiked(set.has(id));
    } catch {
      setLiked((v) => !v);
    }
  };

  const download = async () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "aiexor.png";
    a.rel = "noreferrer";
    a.click();
  };

  return (
    <div className="gen-card">
      <img className="gen-image" src={imageUrl} alt={prompt} loading="lazy" />
      <div className="gen-actions">
        <button type="button" className="action-btn" onClick={toggleLike} aria-pressed={liked}>
          <IconHeart filled={liked} />
          <span>Like</span>
        </button>

        <button type="button" className="action-btn" onClick={onRemix}>
          <IconRemix />
          <span>Remix</span>
        </button>

        <button type="button" className="action-btn" onClick={download}>
          <IconDownload />
          <span>Download</span>
        </button>

        <button type="button" className="action-btn danger" onClick={onDelete}>
          <IconTrash />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2l1.5 5.2L19 9l-5.5 1.8L12 16l-1.5-5.2L5 9l5.5-1.8L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconWand() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20l10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 5l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M15 3l1 2M19 7l2 1M17 9l1 2M11 1l1 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h12M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-7-4.4-9.3-8.6C1 9 3 6 6.4 6c2 0 3.3 1.2 3.6 1.6.3-.4 1.6-1.6 3.6-1.6C17 6 19 9 21.3 12.4 19 16.6 12 21 12 21Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
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
      <path
        d="M7 7h10v10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17 7 7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 7l1 14h10l1-14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 7V4h6v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function clampInt(v: string | null, fallback: number, min: number, max: number) {
  const n = v ? parseInt(v, 10) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function formatTitle(prompt: string) {
  const t = prompt.trim();
  if (!t) return "Untitled";
  return t.length > 42 ? t.slice(0, 42) + "…" : t;
}
function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const s = Math.max(1, Math.floor((Date.now() - d) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

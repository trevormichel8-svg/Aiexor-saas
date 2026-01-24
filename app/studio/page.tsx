"use client";

import { useMemo, useRef, useState } from "react";

type Provider = "openai" | "vertex";

type OutputCard = {
  id: string;
  prompt: string;
  provider: Provider;
  imageUrl?: string;
  status: "loading" | "ready" | "error";
  message?: string;
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v12" />
      <polyline points="5 13 12 20 19 13" />
      <path d="M5 19h14" />
    </svg>
  );
}
function RemixIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.13-3.36l5.36 5.36" />
      <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 13" />
    </svg>
  );
}
function BrushIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.1 6.1 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.1 8.1 0 0 1-3.078.132 4 4 0 0 1-.562-.135 1.4 1.4 0 0 1-.466-.247.7.7 0 0 1-.204-.288.62.62 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.33-.56.76-1.29 1.51-1.56.69-.247 1.4-.09 1.95.12.35.13.64.3.81.42.54-.23 1.02-.55 1.43-.95 2.35-2.47 5.56-7.21 7.09-10.64a.5.5 0 0 1 .584-.29z" />
      <path d="M11.25 3.5l1.25 1.25" />
      <path d="M3.5 12.5c.4.4 1.5.5 2.4-.4" />
    </svg>
  );
}
function GenerateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="14" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
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
      "Vintage","Psychedelic","Horror"
    ],
    []
  );

  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [styleOpen, setStyleOpen] = useState(false);
  const [cards, setCards] = useState<OutputCard[]>([]);
  const [busy, setBusy] = useState(false);

  const outputRef = useRef<HTMLDivElement | null>(null);

  async function callGenerate(p: string, prov: Provider) {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: p,
        provider: prov,
        // Keep defaults aligned with your current UI; you can surface these later.
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
    return images;
  }

  function scrollToBottom() {
    const el = outputRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  async function generateNew(p: string, prov: Provider) {
    const clean = p.trim();
    if (!clean) return;

    setBusy(true);
    const id = uid();
    setCards((prev) => [...prev, { id, prompt: clean, provider: prov, status: "loading" }]);
    queueMicrotask(scrollToBottom);

    try {
      const images = await callGenerate(clean, prov);
      // Only render first result for now (your original UI shows one per card).
      const first = images[0]!;
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, imageUrl: first, status: "ready" } : c)));
      queueMicrotask(scrollToBottom);
    } catch (e: any) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: "error", message: e?.message ?? "Failed to generate" } : c
        )
      );
    } finally {
      setBusy(false);
    }
  }

  async function remix(cardId: string) {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status: "loading" } : c)));
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    try {
      const images = await callGenerate(card.prompt, provider);
      const first = images[0]!;
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, imageUrl: first, status: "ready" } : c)));
    } catch (e: any) {
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, status: "error", message: e?.message ?? "Failed" } : c))
      );
    }
  }

  function download(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const emptyVisible = cards.length === 0;

  return (
    <>
      <div id="empty-state" className="empty-state" style={{ display: emptyVisible ? "flex" : "none" }}>
        <h1 className="first-message">Generate Your First Image</h1>
        <div className="preset-prompts">
          {[
            "Sunset over ocean",
            "Cute robot in forest",
            "Futuristic city skyline",
            "Dragon flying over mountains",
          ].map((p) => (
            <button
              key={p}
              type="button"
              className="preset-btn"
              data-prompt={p}
              onClick={() => {
                setPrompt(p);
                void generateNew(p, provider);
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div id="output" className="output" ref={outputRef}>
        {cards.map((c) => (
          <div key={c.id} className="image-container" data-prompt={c.prompt}>
            {c.status === "loading" ? (
              <p className="loading">Generating...</p>
            ) : c.status === "error" ? (
              <p className="loading">{c.message ?? "Failed to generate image"}</p>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.imageUrl} alt="Generated image" />
            )}

            <div className="image-controls">
              <button
                type="button"
                className="image-remix-btn"
                aria-label="Remix image"
                onClick={() => void remix(c.id)}
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
            </div>
          </div>
        ))}
      </div>

      <div id="style-menu" className={`style-menu ${styleOpen ? "open" : ""}`}>
        {styles.map((s) => (
          <button
            key={s}
            type="button"
            className="style-pill"
            data-style={s}
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

      <form
        className="prompt-bar"
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
          required
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

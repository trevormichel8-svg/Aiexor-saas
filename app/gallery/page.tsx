"use client";

import { useEffect, useMemo, useState } from "react";

type GalleryItem = {
  id: string;
  prompt: string;
  imageUrl?: string;
  image?: string;
  provider: string;
  model: string | null;
  createdAt: string;
  likeCount?: number;
};

function getImageUrl(item: GalleryItem): string | undefined {
  return item.imageUrl ?? item.image;
}

function ClickIcon({
  icon,
  label,
  title,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <span
      className="bi-action"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled ? "true" : "false"}
      title={title ?? label}
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
    >
      <i className={`bi ${icon}`} aria-hidden="true" />
    </span>
  );
}

export default function GalleryPage() {
  const [sort, setSort] = useState<"recent" | "trending" | "liked">("recent");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [active, setActive] = useState<{
    url: string;
    prompt: string;
    provider: string;
    model: string | null;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liking, setLiking] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/gallery?sort=${sort}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    if (active) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [active]);

  async function copyPrompt(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 900);
  }

  function download(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "gallery-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function toggleLike(id: string) {
    if (liking[id]) return;
    setLiking((m) => ({ ...m, [id]: true }));

    // optimistic +1
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, likeCount: (it.likeCount ?? 0) + 1 } : it)));

    try {
      const res = await fetch("/api/gallery/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Like failed");

      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, likeCount: Number(json.likeCount ?? it.likeCount ?? 0) } : it))
      );
    } catch {
      // rollback
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, likeCount: Math.max(0, (it.likeCount ?? 1) - 1) } : it))
      );
    } finally {
      setLiking((m) => ({ ...m, [id]: false }));
    }
  }

  const safeItems = useMemo(() => items, [items]);

  return (
    <div className="page">
      <h1 className="page-title">Gallery</h1>
      <div className="gallery-sort-row">
        <button type="button" className={`pill-btn ${sort === "recent" ? "active" : ""}`} onClick={() => setSort("recent")}>
          <i className="bi bi-clock-history" aria-hidden="true"></i><span>Recent</span>
        </button>
        <button type="button" className={`pill-btn ${sort === "trending" ? "active" : ""}`} onClick={() => setSort("trending")}>
          <i className="bi bi-graph-up-arrow" aria-hidden="true"></i><span>Trending</span>
        </button>
        <button type="button" className={`pill-btn ${sort === "liked" ? "active" : ""}`} onClick={() => setSort("liked")}>
          <i className="bi bi-heart-fill" aria-hidden="true"></i><span>Top</span>
        </button>
      </div>

      {loading && <p className="loading">Loading...</p>}

      <div className="output-grid">
        {safeItems.map((item) => {
          const url = getImageUrl(item);
          const likeCount = item.likeCount ?? 0;

          return (
            <div key={item.id} className="image-container">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={item.prompt}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setActive({
                      url,
                      prompt: item.prompt,
                      provider: item.provider,
                      model: item.model,
                    })
                  }
                />
              ) : null}

              <div className="image-meta">
                <p className="image-prompt">{item.prompt}</p>
                <p className="image-model">
                  {item.provider}
                  {item.model ? ` • ${item.model}` : ""}
                </p>

                <div className="gallery-actions">
                  <ClickIcon
                    icon={copiedId === item.id ? "bi-check2" : "bi-clipboard"}
                    label="Copy prompt"
                    title={copiedId === item.id ? "Copied" : "Copy prompt"}
                    onClick={() => void copyPrompt(item.id, item.prompt)}
                  />

                  <ClickIcon
                    icon="bi-heart"
                    label="Like"
                    title="Like"
                    onClick={() => void toggleLike(item.id)}
                    disabled={!!liking[item.id]}
                  />

                  <span className="like-count" aria-label={`Likes: ${likeCount}`}>
                    {likeCount}
                  </span>

                  {url ? (
                    <ClickIcon
                      icon="bi-download"
                      label="Download image"
                      title="Download"
                      onClick={() => download(url)}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen viewer */}
      {active ? (
        <div
          onClick={() => setActive(null)}
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="gallery-modal-inner"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.url} alt={active.prompt} className="gallery-modal-img" />

            <div className="gallery-modal-footer">
              <div className="gallery-modal-text">
                <div className="gallery-modal-prompt">{active.prompt}</div>
                <div className="gallery-modal-sub">
                  {active.provider}
                  {active.model ? ` • ${active.model}` : ""}
                </div>
              </div>

              <div className="gallery-actions">
                <ClickIcon
                  icon={copiedId === "active" ? "bi-check2" : "bi-clipboard"}
                  label="Copy prompt"
                  title={copiedId === "active" ? "Copied" : "Copy prompt"}
                  onClick={() => void copyPrompt("active", active.prompt)}
                />
                <ClickIcon
                  icon="bi-download"
                  label="Download image"
                  title="Download"
                  onClick={() => download(active.url)}
                />
                <ClickIcon
                  icon="bi-x-lg"
                  label="Close"
                  title="Close"
                  onClick={() => setActive(null)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

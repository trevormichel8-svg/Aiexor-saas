"use client";

import { useState } from "react";

type ImageItem = {
  key: string;
  url: string;
  prompt: string;
};

export default function StudioPage() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    // fake placeholder image
    const img: ImageItem = {
      key: crypto.randomUUID(),
      url: "https://placehold.co/1024x1024",
      prompt,
    };

    setImages((cur) => [img, ...cur]);
    setPrompt("");
    setLoading(false);
  };

  return (
    <div className="studio-page">
      {/* Images */}
      <div className="image-feed">
        {images.map((img) => (
          <div key={img.key} className="image-card">
            <img src={img.url} alt={img.prompt} />

            {/* Controls under image */}
            <div className="image-controls">
              <button className="icon-btn" aria-label="Download">
                ⬇
              </button>

              <button className="icon-btn" aria-label="Remix">
                ♻
              </button>

              <button
                className={`icon-btn ${liked[img.key] ? "active" : ""}`}
                aria-label="Like"
                onClick={() =>
                  setLiked((cur) => ({
                    ...cur,
                    [img.key]: !cur[img.key],
                  }))
                }
              >
                ♥
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Prompt Bar */}
      <div className="prompt-container">
        <textarea
          className="prompt-input"
          placeholder="Describe your image…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          className="circle-btn generate-btn"
          onClick={generateImage}
          disabled={loading}
        >
          {loading ? "…" : "➜"}
        </button>
      </div>
    </div>
  );
}

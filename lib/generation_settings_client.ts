"use client";

import type { GenerationSettings } from "./generation_settings";
import { DEFAULT_SETTINGS, aspectToOpenAISize, aspectToVertexRatio } from "./generation_settings";

const KEY = "aiexor.generationSettings.v1";
const EVT = "aiexor:generationSettings";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function loadSettings(): GenerationSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) return DEFAULT_SETTINGS;

    const s = { ...DEFAULT_SETTINGS, ...parsed } as GenerationSettings;

    // Ensure derived fields are consistent with `aspect`
    s.openai = { ...DEFAULT_SETTINGS.openai, ...(isObject((s as any).openai) ? (s as any).openai : {}) };
    s.vertex = { ...DEFAULT_SETTINGS.vertex, ...(isObject((s as any).vertex) ? (s as any).vertex : {}) };

    s.openai.size = aspectToOpenAISize(s.aspect);
    s.vertex.aspectRatio = aspectToVertexRatio(s.aspect);

    return s;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(next: GenerationSettings) {
  const normalized: GenerationSettings = {
    ...next,
    openai: {
      ...next.openai,
      size: aspectToOpenAISize(next.aspect),
    },
    vertex: {
      ...next.vertex,
      aspectRatio: aspectToVertexRatio(next.aspect),
      sampleCount: Math.max(1, Math.min(4, Math.trunc(next.vertex.sampleCount || 1))),
    },
  };

  localStorage.setItem(KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(EVT, { detail: normalized }));
}

export function subscribeSettings(cb: (s: GenerationSettings) => void) {
  const on = (e: Event) => {
    const ce = e as CustomEvent;
    if (ce?.detail) cb(ce.detail as GenerationSettings);
    else cb(loadSettings());
  };
  window.addEventListener(EVT, on);
  window.addEventListener("storage", on);
  return () => {
    window.removeEventListener(EVT, on);
    window.removeEventListener("storage", on);
  };
}

"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ProviderId = "openai" | "vertex";

export type ModelId =
  | "dall-e-2"
  | "dall-e-3"
  | "gpt-image-1.5"
  | "imagen-4.0-fast-generate-001"
  | "imagen-4.0-generate-001"
  | "imagen-4.0-ultra-generate-001"
  | "imagen-3.0-generate-002"
  | "imagen-3.0-fast-generate-001";

export type ModelOption = { id: ModelId; label: string };

export const MODEL_OPTIONS: Record<ProviderId, ModelOption[]> = {
  openai: [
    { id: "dall-e-2", label: "DALL·E 2" },
    { id: "dall-e-3", label: "DALL·E 3" },
    { id: "gpt-image-1.5", label: "GPT-Image 1.5" },
  ],
  vertex: [
    { id: "imagen-4.0-fast-generate-001", label: "Imagen 4 Fast" },
    { id: "imagen-4.0-generate-001", label: "Imagen 4" },
    { id: "imagen-4.0-ultra-generate-001", label: "Imagen 4 Ultra" },
    { id: "imagen-3.0-generate-002", label: "Imagen 3 (002)" },
    { id: "imagen-3.0-fast-generate-001", label: "Imagen 3 Fast" },
  ],
};

const DEFAULT_MODEL: Record<ProviderId, ModelId> = {
  openai: "dall-e-3",
  vertex: "imagen-4.0-fast-generate-001",
};

type ProviderContextValue = {
  provider: ProviderId;
  setProvider: (provider: ProviderId) => void;

  model: ModelId;
  setModel: (model: ModelId) => void;

  modelOptions: ModelOption[];
};

const ProviderContext = createContext<ProviderContextValue | null>(null);

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function ProviderContextProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProviderState] = useState<ProviderId>(() => readLS("aiexor.provider", "openai"));

  const [model, setModelState] = useState<ModelId>(() => {
    const p = readLS<ProviderId>("aiexor.provider", "openai");
    return readLS<ModelId>("aiexor.model", DEFAULT_MODEL[p]);
  });

  const modelOptions = useMemo(() => MODEL_OPTIONS[provider], [provider]);

  const setProvider = (p: ProviderId) => setProviderState(p);
  const setModel = (m: ModelId) => setModelState(m);

  useEffect(() => writeLS("aiexor.provider", provider), [provider]);
  useEffect(() => writeLS("aiexor.model", model), [model]);

  useEffect(() => {
    const allowed = new Set(MODEL_OPTIONS[provider].map((o) => o.id));
    if (!allowed.has(model)) setModelState(DEFAULT_MODEL[provider]);
  }, [provider, model]);

  const value = useMemo(
    () => ({ provider, setProvider, model, setModel, modelOptions }),
    [provider, model, modelOptions]
  );

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

export function useProvider() {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error("useProvider must be used within ProviderContextProvider");
  return ctx;
  }

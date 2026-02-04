"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type ProviderId = "openai" | "vertex";

type ProviderContextValue = {
  provider: ProviderId;
  setProvider: (provider: ProviderId) => void;
};

const ProviderContext = createContext<ProviderContextValue | null>(null);

export function ProviderContextProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ProviderId>("openai");

  const value = useMemo(() => ({ provider, setProvider }), [provider]);
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

export function useProvider() {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error("useProvider must be used within ProviderContextProvider");
  return ctx;
}

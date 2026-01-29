"use client";

import { useEffect, useMemo, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const message = useMemo(() => {
    const lines = [
      error?.message ?? "Unknown error",
      error?.digest ? `digest: ${error.digest}` : "",
      error?.stack ?? "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-dvh bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-emerald-950/10 p-5 shadow-[0_0_55px_rgba(16,185,129,0.25)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-emerald-200/70">Aiexor</div>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              Application crashed
            </h1>
            <p className="mt-2 text-sm text-white/70">
              This is the real error message. Copy it and send it to me.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="shrink-0 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 px-4 py-3 text-sm font-medium shadow-[0_0_30px_rgba(16,185,129,0.25)] active:scale-[0.98]"
          >
            Try again
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="text-xs text-white/60">Error message</div>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed">
            {message}
          </pre>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={copy}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm active:scale-[0.98]"
          >
            {copied ? "Copied" : "Copy error"}
          </button>
          <div className="text-xs text-white/40">
            If this keeps happening, reload the page.
          </div>
        </div>
      </div>
    </div>
  );
}

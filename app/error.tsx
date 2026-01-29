"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logs will appear in Vercel logs + browser console
    console.error("App error:", error);
  }, [error]);

  const message =
    typeof error?.message === "string" && error.message.length > 0
      ? error.message
      : "Unknown client-side error";

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-black">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-black/50 p-6 shadow-[0_0_50px_rgba(0,255,200,0.18)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-white/70">Aiexor</div>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Something went wrong
            </h1>
          </div>

          <button
            onClick={() => reset()}
            className="shrink-0 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-white shadow-[0_0_18px_rgba(0,255,200,0.18)]"
          >
            Try again
          </button>
        </div>

        <p className="mt-3 text-white/70">
          This is the real error your app hit. Copy it and send it to me.
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="text-xs uppercase tracking-wide text-white/50">
            Error message
          </div>
          <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-white">
            {message}
          </pre>

          {error?.digest ? (
            <>
              <div className="mt-4 text-xs uppercase tracking-wide text-white/50">
                Digest
              </div>
              <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-white">
                {error.digest}
              </pre>
            </>
          ) : null}

          {error?.stack ? (
            <>
              <div className="mt-4 text-xs uppercase tracking-wide text-white/50">
                Stack
              </div>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-white/80">
                {error.stack}
              </pre>
            </>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => {
              try {
                const text = [
                  `Message: ${message}`,
                  error?.digest ? `Digest: ${error.digest}` : "",
                  error?.stack ? `Stack:\n${error.stack}` : "",
                ]
                  .filter(Boolean)
                  .join("\n\n");
                navigator.clipboard?.writeText(text);
              } catch {}
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white/90"
          >
            Copy error
          </button>

          <span className="text-xs text-white/50">
            If Copy doesn’t work on your phone, screenshot this page.
          </span>
        </div>
      </div>
    </main>
  );
}

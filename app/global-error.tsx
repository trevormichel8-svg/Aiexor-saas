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
    console.error("GLOBAL APP ERROR:", error);
  }, [error]);

  const message =
    typeof error?.message === "string" && error.message.length
      ? error.message
      : "Unknown client-side error";

  return (
    <html>
      <body style={{ margin: 0, background: "#000" }}>
        <main
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.55)",
              padding: 20,
              boxShadow: "0 0 50px rgba(0,255,200,0.18)",
              backdropFilter: "blur(10px)",
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Aiexor</div>
                <h1 style={{ margin: "6px 0 0", fontSize: 22 }}>
                  Application crashed
                </h1>
                <div style={{ marginTop: 8, opacity: 0.7, fontSize: 14 }}>
                  This is the real error message. Copy it and send it to me.
                </div>
              </div>

              <button
                onClick={() => reset()}
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(0,255,200,0.30)",
                  background: "rgba(0,255,200,0.10)",
                  color: "white",
                  padding: "10px 14px",
                  boxShadow: "0 0 18px rgba(0,255,200,0.18)",
                }}
              >
                Try again
              </button>
            </div>

            <div
              style={{
                marginTop: 16,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.40)",
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.6 }}>Error message</div>
              <pre
                style={{
                  marginTop: 8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: 13,
                  lineHeight: 1.35,
                }}
              >
                {message}
              </pre>

              {error?.digest ? (
                <>
                  <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>
                    Digest
                  </div>
                  <pre
                    style={{
                      marginTop: 8,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 13,
                      lineHeight: 1.35,
                    }}
                  >
                    {error.digest}
                  </pre>
                </>
              ) : null}

              {error?.stack ? (
                <>
                  <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>
                    Stack
                  </div>
                  <pre
                    style={{
                      marginTop: 8,
                      maxHeight: 280,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 11,
                      opacity: 0.85,
                      lineHeight: 1.35,
                    }}
                  >
                    {error.stack}
                  </pre>
                </>
              ) : null}
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.92)",
                  padding: "10px 14px",
                }}
              >
                Copy error
              </button>

              <span style={{ fontSize: 12, opacity: 0.6 }}>
                If “Copy” fails on mobile, screenshot this page.
              </span>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

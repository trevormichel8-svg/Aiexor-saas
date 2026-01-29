"use client";

import * as React from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error?.message || "Something went wrong.";
  return (
    <html>
      <body>
        <div className="page">
          <div className="page-card">
            <div className="page-title">Application crashed</div>
            <p className="page-subtitle">
              This is the real error message. Copy it and send it to me.
            </p>

            <div className="error-box" role="region" aria-label="Error message">
              <pre className="error-pre">{message}</pre>
              {error?.digest ? <div className="error-digest">digest: {error.digest}</div> : null}
            </div>

            <div className="error-actions">
              <button className="button" type="button" onClick={reset}>
                Try again
              </button>
              <Link className="button button-ghost" href="/studio">
                Go to Studio
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

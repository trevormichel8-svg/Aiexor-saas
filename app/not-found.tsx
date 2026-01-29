import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: 28, marginBottom: 10 }}>Not found</h1>
        <p style={{ opacity: 0.8, marginBottom: 18 }}>
          The page you’re looking for doesn’t exist.
        </p>
        <Link
          href="/studio"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid rgba(0,255,209,0.35)",
            boxShadow: "0 0 22px rgba(0,255,209,0.18)",
            textDecoration: "none",
          }}
        >
          Back to Studio →
        </Link>
      </div>
    </div>
  );
}

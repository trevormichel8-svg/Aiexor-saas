import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <div className="page-card">
        <div className="page-title">Page not found</div>
        <p className="page-subtitle">That link doesn’t exist.</p>

        <div className="row gap">
          <Link className="button" href="/studio">
            Go to Studio
          </Link>
          <Link className="button button-ghost" href="/history">
            View History
          </Link>
        </div>
      </div>
    </div>
  );
}

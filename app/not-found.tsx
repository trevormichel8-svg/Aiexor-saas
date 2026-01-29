import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/50 p-6 shadow-[0_0_40px_rgba(0,255,200,0.15)] backdrop-blur">
        <div className="text-sm text-white/70">Aiexor</div>
        <h1 className="mt-2 text-2xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-white/70">
          That link doesn’t exist. Go back to Studio.
        </p>

        <div className="mt-5 flex gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-white shadow-[0_0_18px_rgba(0,255,200,0.18)]"
          >
            Go to Studio
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white/90"
          >
            History
          </Link>
        </div>
      </div>
    </main>
  );
}


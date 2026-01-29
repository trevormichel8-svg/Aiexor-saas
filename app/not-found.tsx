import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh px-5 py-10">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-black/60 p-6 shadow-[0_0_40px_rgba(0,255,220,0.14)]">
        <div className="text-sm text-white/60">Aiexor</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
          Page not found
        </h1>
        <p className="mt-3 text-white/70">
          That link doesn’t exist. Go back to Studio or History.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/studio"
            className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-2 text-white shadow-[0_0_28px_rgba(0,255,220,0.20)]"
          >
            Go to Studio
          </Link>
          <Link
            href="/history"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white/90"
          >
            Go to History
          </Link>
          <Link
            href="/sign-in"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white/90"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

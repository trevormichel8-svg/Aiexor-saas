"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import CreditsPill from "./CreditsPill";
import UserMenuButton from "./UserMenuButton";

type NavItem = { href: string; label: string; icon: "studio" | "history" };

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const shareRef = useRef<HTMLDivElement | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const nav: NavItem[] = [
    { href: "/studio", label: "Studio", icon: "studio" },
    { href: "/history", label: "History", icon: "history" },
  ];
const isActive = (href: string) => pathname === href;

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (shareOpen && shareRef.current && t && !shareRef.current.contains(t)) setShareOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareOpen]);

  // Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setShareOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const updateParam = (key: string, value?: string) => {
    const sp = new URLSearchParams(searchParams?.toString());
    if (!value) sp.delete(key);
    else sp.set(key, value);
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const provider = searchParams?.get("provider") ?? "openai";
  const aspect = searchParams?.get("ar") ?? "1:1";
  const negative = searchParams?.get("neg") ?? "";
  const people = searchParams?.get("people") ?? "allow_adult";
  const samples = searchParams?.get("samples") ?? "1";

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareTo = (platform: "x" | "facebook" | "reddit") => {
    const u = encodeURIComponent(shareUrl);
    const text = encodeURIComponent("Check this out!");
    const map = {
      x: `https://twitter.com/intent/tweet?url=${u}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      reddit: `https://www.reddit.com/submit?url=${u}&title=${text}`,
    } as const;
    window.open(map[platform], "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setShareOpen(false);
  };

  const nativeShare = async () => {
    try {
      const nav = navigator as unknown as { share?: (data: any) => Promise<void> };
      if (nav.share) {
        await nav.share({ url: shareUrl, title: "Aiexor" });
        setShareOpen(false);
        return;
      }
    } catch {}
    // no-op
  };

  const showStudioControls = pathname === "/studio";

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="top-left">
          <button
            className="icon-button icon-button--circle"
            aria-label="Open sidebar"
            type="button"
            onClick={() => setOpen(true)}
          >
            <IconHamburger />
          </button>

          <Link href="/studio" className="brand-pill" aria-label="Go to Studio">
            <span className="brand-text">Aiexor</span>
          </Link>
        </div>

        <div className="top-right">
          <SignedOut>
            <Link className="btn btn-primary" href="/sign-in">
              Sign in
            </Link>
          </SignedOut>

          <SignedIn>
            <CreditsPill />
          </SignedIn>

          <SignedIn>
            <UserMenuButton />
          </SignedIn>

          <div className="share-menu" ref={shareRef}>
            <button
              className="icon-button icon-button--circle"
              aria-label="Share"
              type="button"
              onClick={() => setShareOpen((v) => !v)}
            >
              <IconShare />
            </button>

            {shareOpen ? (
              <div className="share-pop" role="dialog" aria-label="Share">
                <div className="share-title">Share</div>

                <button className="share-item" type="button" onClick={nativeShare}>
                  <IconSend />
                  <span>Share sheet</span>
                </button>

                <button className="share-item" type="button" onClick={copyLink}>
                  <IconLink />
                  <span>Copy link</span>
                </button>

                <div className="share-sep" />

                <button className="share-item" type="button" onClick={() => shareTo("x")}>
                  <IconX />
                  <span>X</span>
                </button>

                <button className="share-item" type="button" onClick={() => shareTo("facebook")}>
                  <IconFacebook />
                  <span>Facebook</span>
                </button>

                <button className="share-item" type="button" onClick={() => shareTo("reddit")}>
                  <IconReddit />
                  <span>Reddit</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <main className="content">{children}</main>

      <div id="sidebar" className={`sidebar ${open ? "open" : ""}`} aria-hidden={!open}>
        <button
          id="close-sidebar"
          className="close-sidebar-btn"
          aria-label="Close sidebar"
          type="button"
          onClick={() => setOpen(false)}
        >
          &times;
        </button>

        <div className="sidebar-content">
          <h2>Menu</h2>

          <nav className="sidebar-nav">
            {nav.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`sidebar-link ${isActive(it.href) ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <NavIcon icon={it.icon} />
                <span>{it.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Create</div>

            <div className="sidebar-kv">
              <span>Image to image</span>
              <span className="tag tag-soon">Soon</span>
            </div>

            <div className="sidebar-kv">
              <span>Text integration</span>
              <span className="tag tag-soon">Soon</span>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Controls</div>

            <label className="field">
              <span className="field-label">Model</span>
              <select
                className="select"
                value={provider}
                onChange={(e) => updateParam("provider", e.target.value)}
                disabled={!showStudioControls}
              >
                <option value="openai">OpenAI (gpt-image-1)</option>
                <option value="vertex">Google Vertex</option>
              </select>
            </label>

            <label className="field">
              <span className="field-label">Aspect ratio</span>
              <select
                className="select"
                value={aspect}
                onChange={(e) => updateParam("ar", e.target.value)}
                disabled={!showStudioControls}
              >
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
              <div className="field-hint">Used by Vertex. OpenAI ignores this for now.</div>
            </label>

            <label className="field">
              <span className="field-label">Negative prompt</span>
              <input
                className="input"
                value={negative}
                onChange={(e) => updateParam("neg", e.target.value)}
                placeholder="What to avoid…"
                disabled={!showStudioControls}
              />
            </label>

            <label className="field">
              <span className="field-label">People</span>
              <select
                className="select"
                value={people}
                onChange={(e) => updateParam("people", e.target.value)}
                disabled={!showStudioControls}
              >
                <option value="allow_all">Allow all</option>
                <option value="allow_adult">Adults only</option>
                <option value="allow_none">No people</option>
              </select>
            </label>

            <label className="field">
              <span className="field-label">Samples</span>
              <input
                className="input"
                inputMode="numeric"
                value={samples}
                onChange={(e) => updateParam("samples", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="1"
                disabled={!showStudioControls}
              />
              <div className="field-hint">Vertex can return multiple images.</div>
            </label>

            <div className="sidebar-kv">
              <span>Seed control</span>
              <span className="tag tag-soon">Soon</span>
            </div>

            <div className="sidebar-kv">
              <span>AI upscaling</span>
              <span className="tag tag-soon">Soon</span>
            </div>

            <div className="sidebar-kv">
              <span>Character consistency</span>
              <span className="tag tag-soon">Soon</span>
            </div>

            <div className="sidebar-kv">
              <span>Lighting & composition</span>
              <span className="tag tag-soon">Soon</span>
            </div>

            <div className="sidebar-kv">
              <span>Parameter settings</span>
              <span className="tag tag-soon">Soon</span>
            </div>
          </div>

          <div className="sidebar-footer-hint">
            Tip: these sidebar controls sync to the URL, so you can share settings.
          </div>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ icon }: { icon: NavItem["icon"] }) {
  const map: Record<NavItem["icon"], React.ReactNode> = {
    studio: <IconWand />,
    history: <IconHistory />,
  };
  return <span className="nav-icon">{map[icon]}</span>;
}

function IconHamburger() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 8a3 3 0 1 0-2.83-4H12a3 3 0 0 0 3 3Zm-6 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12-2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        fill="currentColor"
        opacity="0.24"
      />
      <path
        d="M9.7 14.9l4.6-2.6M9.7 19.1l4.6-2.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21 12L3 21l3-9-3-9 18 9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M6 12h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconWand() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20l10-10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 5l6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 3l1 2M19 7l2 1M17 9l1 2M11 1l1 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 12a9 9 0 1 0 3-6.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M3 4v5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 4h4l5 6 5-6h2l-6 8 6 8h-4l-5-6-5 6H5l6-8-6-8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v3H7v3h3v6h3v-6h3l1-3h-4v-3c0-.6.4-1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconReddit() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 12c0 4.4-3.6 8-8 8s-8-3.6-8-8c0-2.2 1-4.2 2.6-5.6l1.4 1.2A6 6 0 0 0 6 12c0 3.3 2.7 6 6 6s6-2.7 6-6a6 6 0 0 0-2-4.5l1.4-1.2A8 8 0 0 1 20 12Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M15.5 13.5a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm-7 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm3.5 3.2c-1.5 0-2.8-.6-3.5-1.5l1.2-.9c.5.6 1.3 1 2.3 1s1.8-.4 2.3-1l1.2.9c-.7.9-2 1.5-3.5 1.5Z"
        fill="currentColor"
      />
      <path
        d="M14.4 6.2 15.2 3l3.2.8-.4 1.5-1.7-.4-.5 2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

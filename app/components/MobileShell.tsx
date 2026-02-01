"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileShellProps = {
  children: React.ReactNode;
};

const MODEL_STORAGE_KEY = "aiexor:model";

export default function MobileShell({ children }: MobileShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [model, setModel] = useState<string>(() => {
    if (typeof window === "undefined") return "gpt-image-1";
    return window.localStorage.getItem(MODEL_STORAGE_KEY) || "gpt-image-1";
  });

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  function isActive(href: string) {
    return pathname === href;
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Persist model selection + notify app (optional listener elsewhere)
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MODEL_STORAGE_KEY, model);
    window.dispatchEvent(new CustomEvent("aiexor:model-change", { detail: { model } }));
  }, [model]);

  async function onShare() {
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
          title: "Aiexor",
          url: shareUrl,
        });
        return;
      }
    } catch {
      // ignore share cancel/errors
    }

    // fallback: copy link
    try {
      await navigator.clipboard.writeText(shareUrl);
      // If you have a toast system, hook it up here.
    } catch {
      // ignore
    }
  }

  return (
    <div className="mobile-frame">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-left">
          <button
            className="hamburger icon-button"
            aria-label="Menu"
            type="button"
            onClick={() => setOpen(true)}
          >
            <IconMenu />
          </button>
          <div className="app-label">Aiexor</div>
        </div>

        <div className="top-right">
          <Link
            className={`icon-button ${isActive("/signin") ? "active" : ""}`}
            aria-label="Sign in"
            href="/signin"
          >
            <IconUser />
          </Link>

          <button className="icon-button" aria-label="Share" type="button" onClick={onShare}>
            <IconShare />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="content">{children}</main>

      {/* SIDEBAR OVERLAY */}
      <button
        type="button"
        aria-label="Close sidebar overlay"
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* SIDEBAR */}
      <aside id="sidebar" className={`sidebar ${open ? "open" : ""}`} aria-hidden={!open}>
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
          <div className="sidebar-section">
            <div className="sidebar-title">Account</div>

            {/* Keep only what you asked for */}
            <Link className="sidebar-link" href="/pricing" onClick={() => setOpen(false)}>
              <span className="sidebar-link-icon">
                <IconBolt />
              </span>
              Upgrade
            </Link>

            <Link className="sidebar-link" href="/pricing#credits" onClick={() => setOpen(false)}>
              <span className="sidebar-link-icon">
                <IconCoins />
              </span>
              Credits
            </Link>
          </div>

          {/* MODEL SELECTOR moved into sidebar */}
          <div className="sidebar-section">
            <div className="sidebar-title">Model</div>

            <label className="sidebar-label" htmlFor="model-select">
              Choose model
            </label>

            <select
              id="model-select"
              className="sidebar-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gpt-image-1">gpt-image-1</option>
              <option value="dall-e-3">dall-e-3</option>
              <option value="dall-e-2">dall-e-2</option>
            </select>

            <div className="sidebar-hint">
              This selection is saved on your device and can be read by your generator UI.
            </div>
          </div>

          {/* You can add other non-account sidebar items here later, but keeping it minimal */}
        </div>
      </aside>
    </div>
  );
}

/* ----------------------------- ICONS (inline) ----------------------------- */

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 8a3 3 0 1 0-2.83-4H13a3 3 0 0 0 3 4ZM6 14a3 3 0 1 0 2.83 4H9a3 3 0 0 0-3-4Zm10 1-8-4m8-3-8 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 21a8 8 0 1 0-16 0M12 13a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCoins() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 6c4.42 0 8-1.34 8-3s-3.58-3-8-3-8 1.34-8 3 3.58 3 8 3Zm8 3c0 1.66-3.58 3-8 3s-8-1.34-8-3m16 4c0 1.66-3.58 3-8 3s-8-1.34-8-3m16 4c0 1.66-3.58 3-8 3s-8-1.34-8-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

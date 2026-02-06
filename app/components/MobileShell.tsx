"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SignedIn, SignedOut, SignInButton, useClerk } from "@clerk/nextjs";
import { UserMenuButton } from "./UserMenuButton";
import { CreditsPill } from "./CreditsPill";
import { useProvider, type ProviderId } from "../providers/provider-context";

function IconUser() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

function IconLogOut() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function pageLabel(pathname: string) {
  if (pathname.startsWith("/studio")) return "Studio";
  if (pathname.startsWith("/billing")) return "Billing";
  if (pathname.startsWith("/account")) return "Account";
  return "Home";
}

export function MobileShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const clerk = useClerk();

  const { provider, setProvider } = useProvider();

  const providers: { id: ProviderId; label: string }[] = useMemo(
    () => [
      { id: "openai", label: "OpenAI" },
      { id: "vertex", label: "Vertex AI" },
    ],
    []
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.title = `AI.Exor • ${pageLabel(pathname)}`;
  }, [pathname]);

  return (
    <div className="mobile-frame">
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
          <div className="app-label">AI.Exor</div>
        </div>

        <div className="top-right">
          <SignedIn>
            <CreditsPill />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="credits-pill" aria-label="Sign in" type="button">
                <IconUser />
                <span>Sign in</span>
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserMenuButton />
          </SignedIn>
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

          {pathname.startsWith("/studio") ? (
            <div className="sidebar-section" style={{ marginTop: "0.75rem" }}>
              <div
                className="sidebar-label"
                style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.35rem" }}
              >
                Provider
              </div>
              <select
                id="provider-select-sidebar"
                className="provider-select"
                aria-label="Image model provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value as ProviderId)}
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Pills removed: Studio / Billing / Account */}

          <SignedIn>
            <div style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="sidebar-link"
                onClick={() => clerk.signOut({ redirectUrl: "/" })}
              >
                <IconLogOut />
                <span>Sign out</span>
              </button>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
    

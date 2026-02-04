"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { SignedIn, SignedOut, SignInButton, useClerk } from "@clerk/nextjs";
import { UserMenuButton } from "./UserMenuButton";
import { CreditsPill } from "./CreditsPill";
import { useProvider, type ProviderId } from "../providers/provider-context";

type NavItem = { href: string; label: string; icon: "sparkles" | "card" | "user" };

function IconSparkles() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l1.5 5L19 9l-5.5 2L12 16l-1.5-5L5 9l5.5-2L12 2z" />
      <path d="M4 14l.8 2.6L7.4 18l-2.6.8L4 21l-.8-2.2L1 18l2.2-.8L4 14z" />
    </svg>
  );
}
function IconCreditCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}
function IconEllipsis() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function NavIcon({ icon }: { icon: NavItem["icon"] }) {
  if (icon === "card") return <IconCreditCard />;
  if (icon === "user") return <IconUser />;
  return <IconSparkles />;
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

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  const items: NavItem[] = useMemo(
    () => [
      { href: "/studio", label: "Studio", icon: "sparkles" },
      { href: "/billing", label: "Billing", icon: "card" },
      { href: "/account", label: "Account", icon: "user" },
    ],
    []
  );

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.title = `Aiexor • ${pageLabel(pathname)}`;
  }, [pathname]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!moreOpen) return;
      const t = e.target as Node | null;
      if (!t) return;
      if (moreRef.current?.contains(t)) return;
      setMoreOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [moreOpen]);

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <div className="mobile-frame">
      <div className="top-bar">
        <div className="top-left">
          <button className="hamburger icon-button" aria-label="Menu" type="button" onClick={() => setOpen(true)}>
            <IconMenu />
          </button>
          <div className="app-label">Aiexor</div>
        </div>

        <div className="top-right">
          <SignedIn>
            <CreditsPill />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button id="sign-in-btn" className="icon-button" aria-label="Sign in" type="button">
                <IconUser />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserMenuButton />
          </SignedIn>

          <div className="more-menu" ref={moreRef}>
            <button className="icon-button" aria-label="More" type="button" onClick={() => setMoreOpen((v) => !v)}>
              <IconEllipsis />
            </button>

            {moreOpen ? (
              <div className="more-pop" role="menu" aria-label="More menu">
                {items.map((it) => (
                  <Link key={it.href} className="more-item" href={it.href} onClick={() => setMoreOpen(false)}>
                    <NavIcon icon={it.icon} />
                    <span>{it.label}</span>
                  </Link>
                ))}

                <SignedIn>
                  <button
                    className="more-item"
                    type="button"
                    onClick={() => {
                      setMoreOpen(false);
                      clerk.signOut({ redirectUrl: "/" });
                    }}
                  >
                    <IconLogOut />
                    <span>Sign out</span>
                  </button>
                </SignedIn>
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
          {pathname.startsWith("/studio") ? (
            <div className="sidebar-section" style={{ marginTop: "0.75rem" }}>
              <div className="sidebar-label" style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.35rem" }}>
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

          <nav className="sidebar-nav">
            {items.map((it) => (
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

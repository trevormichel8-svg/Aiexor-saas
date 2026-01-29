"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { UserMenuButton } from "./UserMenuButton";
import { CreditsPill } from "./CreditsPill";


function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
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


function pageLabel(pathname: string) {
  if (pathname.startsWith("/studio")) return "Studio";
  if (pathname.startsWith("/billing")) return "Billing";
  if (pathname.startsWith("/account")) return "Account";
  return "Home";
}

export function MobileShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

const [sidebarProvider, setSidebarProvider] = useState<"openai" | "vertex">("openai");
const [sidebarView, setSidebarView] = useState<"studio" | "history">("studio");

useEffect(() => {
  if (typeof window === "undefined") return;
  const sp = new URLSearchParams(window.location.search);
  const p = sp.get("provider");
  if (p === "openai" || p === "vertex") setSidebarProvider(p);
  const v = sp.get("view");
  setSidebarView(v === "history" ? "history" : "studio");
}, [open, pathname]);

const updateParam = (key: string, value?: string) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!value) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  window.history.replaceState({}, "", url.toString());
  window.dispatchEvent(new Event("aiexor:params"));
};

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.title = `Aiexor • ${pageLabel(pathname)}`;
  }, [pathname]);

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
          <h2>Controls</h2>

          {pathname.startsWith("/studio") ? (
            <div className="sidebar-section">
              <label className="sidebar-label" htmlFor="sidebar-view">
                View
              </label>
              <select
                id="sidebar-view"
                className="sidebar-select"
                value={sidebarView}
                onChange={(e) => {
                  const v = e.target.value === "history" ? "history" : "studio";
                  setSidebarView(v);
                  updateParam("view", v === "studio" ? undefined : "history");
                  setOpen(false);
                }}
              >
                <option value="studio">Studio</option>
                <option value="history">History</option>
              </select>

              <label className="sidebar-label" htmlFor="sidebar-provider" style={{ marginTop: "0.75rem" }}>
                Model
              </label>
              <select
                id="sidebar-provider"
                className="sidebar-select"
                value={sidebarProvider}
                onChange={(e) => {
                  const v = e.target.value === "vertex" ? "vertex" : "openai";
                  setSidebarProvider(v);
                  updateParam("provider", v);
                  setOpen(false);
                }}
              >
                <option value="openai">OpenAI</option>
                <option value="vertex">Vertex AI</option>
              </select>
            </div>
          ) : (
            <div className="sidebar-section">
              <div className="sidebar-muted">Open Studio to see controls.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

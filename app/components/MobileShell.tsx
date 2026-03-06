"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SignedIn, SignedOut, SignInButton, useClerk } from "@clerk/nextjs";
import { UserMenuButton } from "./UserMenuButton";
import { CreditsPill } from "./CreditsPill";
import { useProvider } from "../providers/provider-context";

function pageLabel(pathname: string) {
  if (pathname.startsWith("/studio")) return "Studio";
  if (pathname.startsWith("/billing")) return "Billing";
  if (pathname.startsWith("/account")) return "Account";
  if (pathname.startsWith("/gallery")) return "Gallery";
  return "Home";
}

export function MobileShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const clerk = useClerk();

  const { provider, setProvider, model, setModel, modelOptions } = useProvider();

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
            <i className="bi bi-list" aria-hidden="true" />
          </button>

          <div className="app-label-pill">
            <div className="app-label">AI.Exor</div>
          </div>
        </div>

        <div className="top-right">
          <SignedIn>
            <CreditsPill />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="credits-pill" aria-label="Sign in" type="button">
                <i className="bi bi-person-circle" aria-hidden="true" />
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

      <div
        id="sidebar"
        className={`sidebar ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
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

          {/* Provider pills + model dropdown */}
          <div className="sidebar-section" style={{ marginTop: "0.75rem" }}>
            <div
              className="sidebar-label"
              style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.35rem" }}
            >
              Provider
            </div>

            <div className="provider-pill-row">
              <button
                type="button"
                className={`provider-pill ${provider === "openai" ? "active" : ""}`}
                onClick={() => setProvider("openai")}
              >
                OpenAI
              </button>

              <button
                type="button"
                className={`provider-pill ${provider === "vertex" ? "active" : ""}`}
                onClick={() => setProvider("vertex")}
              >
                Google
              </button>
            </div>

            <div
              className="sidebar-label"
              style={{ fontSize: "0.85rem", opacity: 0.9, margin: "0.75rem 0 0.35rem" }}
            >
              Model
            </div>

            <select
              id="model-select-sidebar"
              className="provider-select"
              aria-label="Image model"
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
            >
              {modelOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional: Gallery link pill (if you already have sidebar-pill styles) */}
          <div style={{ marginTop: "1rem" }}>
            <a href="/gallery" className="sidebar-pill">
              <i className="bi bi-images" aria-hidden="true" />
              <span style={{ marginLeft: "0.5rem" }}>Gallery</span>
            </a>
          </div>

          <SignedIn>
            <div style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="sidebar-link"
                onClick={() => clerk.signOut({ redirectUrl: "/" })}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

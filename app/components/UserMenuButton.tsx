"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

function IconUser(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}
function IconCreditCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function UserMenuButton() {
  const { user } = useUser();
  const clerk = useClerk();
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node | null;
      if (!t) return;
      if (popRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="user-menu" ref={popRef}>
      <button
        className="icon-button"
        aria-label="Account menu"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="avatar" src={user.imageUrl} alt="Account" />
        ) : (
          <IconUser />
        )}
      </button>

      {open ? (
        <div className="user-menu-pop" role="menu" aria-label="Account actions">
          <Link className="user-menu-item" role="menuitem" href="/billing" onClick={() => setOpen(false)}>
            <IconCreditCard />
            <span>Billing</span>
          </Link>
          <Link className="user-menu-item" role="menuitem" href="/account" onClick={() => setOpen(false)}>
            <IconUser />
            <span>Account</span>
          </Link>
          <button
            className="user-menu-item"
            role="menuitem"
            type="button"
            onClick={() => clerk.signOut({ redirectUrl: "/" })}
          >
            <IconLogOut />
            <span>Sign out</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

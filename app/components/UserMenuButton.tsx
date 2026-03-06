 "use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

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
          <i className="bi bi-person-circle"></i>
        )}
      </button>

      {open ? (
        <div className="user-menu-pop" role="menu" aria-label="Account actions">
          <Link
            className="user-menu-item"
            role="menuitem"
            href="/billing"
            onClick={() => setOpen(false)}
          >
            <i className="bi bi-credit-card"></i>
            <span>Billing</span>
          </Link>

          <Link
            className="user-menu-item"
            role="menuitem"
            href="/account"
            onClick={() => setOpen(false)}
          >
            <i className="bi bi-person"></i>
            <span>Account</span>
          </Link>

          <button
            className="user-menu-item"
            role="menuitem"
            type="button"
            onClick={() => clerk.signOut({ redirectUrl: "/" })}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign out</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

export default function MobileShell({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("gpt-image-1");

  return (
    <div className="mobile-shell">
      {/* Top Bar */}
      <header className="top-bar">
        <button
          className="circle-btn"
          aria-label="Open sidebar"
          onClick={() => setOpen(true)}
        >
          ☰
        </button>

        <span className="app-title">Aiexor</span>
      </header>

      {/* Sidebar */}
      {open && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <span>Settings</span>
            <button className="circle-btn" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* Model Selector */}
          <div className="sidebar-section">
            <label className="sidebar-label">Model</label>
            <select
              className="sidebar-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gpt-image-1">GPT Image 1</option>
            </select>
          </div>
        </aside>
      )}

      {/* Main */}
      <main className="mobile-main">{children}</main>
    </div>
  );
}

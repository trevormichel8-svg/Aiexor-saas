import type { ReactNode } from "react";

export function PageCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="output">
      <div className="image-container">
        <div className="page-card-inner">
          <h2 className="page-card-title">{title}</h2>
          <div className="page-card-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

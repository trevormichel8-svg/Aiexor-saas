import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import MobileShell from "./components/MobileShell";

export const metadata: Metadata = {
  title: "Aiexor",
  description: "Aiexor Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div className="content" />}>
          <MobileShell>{children}</MobileShell>
        </Suspense>
      </body>
    </html>
  );
}

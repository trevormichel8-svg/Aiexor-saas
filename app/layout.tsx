import "./globals.css";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import MobileShell from "./components/MobileShell";

export const metadata = {
  title: "Aiexor",
  description: "Aiexor — image generation SaaS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Suspense
            fallback={
              <div className="min-h-dvh bg-black text-white flex items-center justify-center">
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/10 px-5 py-4 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
                  Loading…
                </div>
              </div>
            }
          >
            <MobileShell>{children}</MobileShell>
          </Suspense>
        </ClerkProvider>
      </body>
    </html>
  );
}

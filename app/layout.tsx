import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import MobileShell from "./components/MobileShell";
import { Suspense } from "react";

export const metadata = {
  title: "Aiexor",
  description: "Aiexor — image generation SaaS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Suspense fallback={<div className="min-h-dvh" />}>
  <Suspense fallback={null}><MobileShell>{children}</MobileShell></Suspense>
</Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}

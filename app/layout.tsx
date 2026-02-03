import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { MobileShell } from "./components/MobileShell";

export const metadata = {
  title: "Aiexor",
  description: "Aiexor — image generation SaaS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <MobileShell>{children}</MobileShell>
        </body>
      </html>
    </ClerkProvider>
  );
}

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { MobileShell } from "./components/MobileShell";
import { ProviderContextProvider } from "./providers/provider-context";

export const metadata = {
  title: "Ai.exor",
  description: "Ai.exor image generator",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ProviderContextProvider>
            <MobileShell>{children}</MobileShell>
          </ProviderContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

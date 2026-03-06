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
        
        <head>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" />
        </head>
<body>
          <ProviderContextProvider>
            <MobileShell>{children}</MobileShell>
          </ProviderContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

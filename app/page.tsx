import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Aiexor</h1>
        <div>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <p style={{ opacity: 0.8 }}>
        Minimal SaaS wiring: login, billing, credits, rate-limit, and a protected image generation API.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/studio">Go to Studio</Link>
        <Link href="/billing">Billing</Link>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <SignedOut>
        <p>Sign in to generate images and manage billing.</p>
      </SignedOut>

      <SignedIn>
        <p>You’re signed in — open Studio to test generation.</p>
      </SignedIn>
    </main>
  );
}

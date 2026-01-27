import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { PageCard } from "./components/PageCard";

export default function HomePage() {
  return (
    <PageCard title="Home">
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Welcome to Aiexor. Go to Studio to generate images, or Billing to upgrade.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link className="preset-btn" href="/studio">
          Open Studio
        </Link>
        <Link className="preset-btn" href="/billing">
          Billing
        </Link>
        <Link className="preset-btn" href="/account">
          Account
        </Link>
      </div>

      <div style={{ marginTop: 14 }}>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="preset-btn" type="button">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <p style={{ opacity: 0.85, margin: "10px 0 0" }}>You’re signed in.</p>
        </SignedIn>
      </div>
    </PageCard>
  );
}

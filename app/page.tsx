import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { PageCard } from "@/app/components/PageCard";

export default function HomePage() {
  return (
    <PageCard title="Welcome">
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Aiexor is your image studio. Generate, remix, download, and keep your history.
      </p>

      <div className="page-actions">
        <Link className="pill-link" href="/studio">
          Open Studio
        </Link>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="pill-link" type="button">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Link className="pill-link" href="/billing">
            Billing
          </Link>
        </SignedIn>
      </div>
    </PageCard>
  );
}

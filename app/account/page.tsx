import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import { PageCard } from "@/app/components/PageCard";

export default function AccountPage() {
  return (
    <PageCard title="Account">
      <div className="page-actions">
        <Link className="pill-link" href="/studio">
          Back to Studio
        </Link>
      </div>

      <div className="themed-panel">
        <UserProfile />
      </div>
    </PageCard>
  );
}

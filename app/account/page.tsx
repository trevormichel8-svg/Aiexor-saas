import { UserProfile } from "@clerk/nextjs";
import { PageCard } from "../components/PageCard";

export default function AccountPage() {
  return (
    <PageCard title="Account">
      <div style={{ border: "1px solid rgba(0,255,238,.14)", borderRadius: 16, overflow: "hidden" }}>
        <UserProfile />
      </div>
    </PageCard>
  );
}

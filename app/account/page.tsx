import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>Account</h2>
      <div style={{ border: "1px solid rgba(0,255,238,.14)", borderRadius: 16, overflow: "hidden" }}>
        <UserProfile />
      </div>
    </div>
  );
}

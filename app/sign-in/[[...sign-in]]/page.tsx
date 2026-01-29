import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="page">
      <div className="page-card">
        <div className="page-title">Sign in</div>
        <SignIn appearance={{ elements: { card: "clerk-card" } }} />
      </div>
    </div>
  );
}

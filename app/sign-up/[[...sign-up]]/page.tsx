import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="page">
      <div className="page-card">
        <div className="page-title">Create account</div>
        <SignUp appearance={{ elements: { card: "clerk-card" } }} />
      </div>
    </div>
  );
}

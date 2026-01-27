import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/credits";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await ensureUser(userId);
  return NextResponse.json({
    credits: user.credits,
    subscriptionStatus: user.subscriptionStatus,
  });
}

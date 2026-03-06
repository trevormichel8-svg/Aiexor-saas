import { NextResponse } from "next/server";
import { ensureUser } from "@/lib/auth";

/**
 * Upscale scaffold.
 * Returns same image for now (replace with real upscale later).
 */
export async function POST(req: Request) {
  const user = await ensureUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const imageUrl = body?.imageUrl as string | undefined;
  const scale = Number(body?.scale ?? 2);

  if (!imageUrl) return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
  if (![2, 4].includes(scale)) return NextResponse.json({ error: "Scale must be 2 or 4" }, { status: 400 });

  return NextResponse.json({ imageUrl, scale });
}

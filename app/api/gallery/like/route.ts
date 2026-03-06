import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await ensureUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const galleryItemId = body?.id as string | undefined;
  if (!galleryItemId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const userId = user.id;

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.galleryLike.findUnique({
      where: { userId_galleryItemId: { userId, galleryItemId } },
    });

    if (existing) {
      await tx.galleryLike.delete({ where: { id: existing.id } });
    } else {
      await tx.galleryLike.create({ data: { userId, galleryItemId } });
    }

    const likeCount = await tx.galleryLike.count({ where: { galleryItemId } });
    return { liked: !existing, likeCount };
  });

  return NextResponse.json(result);
}
                                       

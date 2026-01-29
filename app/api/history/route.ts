import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ items: [] });

  const items = await prisma.generation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ items });
}

const DeleteBody = z.object({
  id: z.string().min(1),
});

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bodyJson = await req.json().catch(() => null);
  const parsed = DeleteBody.safeParse(bodyJson);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { id } = parsed.data;

  const existing = await prisma.generation.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.generation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

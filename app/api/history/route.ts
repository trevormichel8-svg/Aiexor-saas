import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ensureUser } from "@/lib/credits";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DeleteBody = z.object({
  id: z.string().trim().min(1).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await ensureUser(userId);

  const items = await prisma.generation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    items: items.map((g) => ({
      id: g.id,
      prompt: g.prompt,
      provider: g.provider,
      image: g.image,
      createdAt: g.createdAt,
    })),
  });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await ensureUser(userId);

  const parsed = DeleteBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if (parsed.data.id) {
    await prisma.generation.deleteMany({
      where: { id: parsed.data.id, userId: user.id },
    });
    return NextResponse.json({ ok: true });
  }

  await prisma.generation.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") ?? "recent";

  const base = {
    take: 60,
    include: { _count: { select: { likes: true } } },
  } as const;

  if (sort === "liked") {
    const items = await prisma.galleryItem.findMany({
      ...base,
      orderBy: { likes: { _count: "desc" } },
    });

    return NextResponse.json(
      items.map((it) => ({
        id: it.id,
        prompt: it.prompt,
        imageUrl: it.image,
        provider: it.provider,
        model: it.model,
        createdAt: it.createdAt,
        likeCount: it._count.likes,
      }))
    );
  }

  if (sort === "trending") {
    const items = await prisma.galleryItem.findMany({
      take: 120,
      include: { _count: { select: { likes: true } } },
      orderBy: { createdAt: "desc" },
    });

    const scored = items
      .map((it) => {
        const hours = Math.max(1, (Date.now() - new Date(it.createdAt).getTime()) / 36e5);
        const score = (it._count.likes || 0) / hours;
        return { it, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)
      .map(({ it }) => ({
        id: it.id,
        prompt: it.prompt,
        imageUrl: it.image,
        provider: it.provider,
        model: it.model,
        createdAt: it.createdAt,
        likeCount: it._count.likes,
      }));

    return NextResponse.json(scored);
  }

  const items = await prisma.galleryItem.findMany({
    ...base,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    items.map((it) => ({
      id: it.id,
      prompt: it.prompt,
      imageUrl: it.image,
      provider: it.provider,
      model: it.model,
      createdAt: it.createdAt,
      likeCount: it._count.likes,
    }))
  );
}

export async function POST(req: Request) {
  const user = await ensureUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const prompt = body?.prompt as string | undefined;
  const imageUrl = (body?.imageUrl ?? body?.image) as string | undefined;
  const provider = body?.provider as string | undefined;
  const model = (body?.model as string | undefined) ?? null;

  if (!prompt || !imageUrl || !provider) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const item = await prisma.galleryItem.create({
    data: {
      prompt,
      image: imageUrl, // prisma field is `image`
      provider,
      model,
    },
  });

  return NextResponse.json({
    id: item.id,
    prompt: item.prompt,
    imageUrl: item.image,
    provider: item.provider,
    model: item.model,
    createdAt: item.createdAt,
    likeCount: 0,
  });
    }

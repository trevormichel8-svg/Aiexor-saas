import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ipRatelimit, userRatelimit } from "@/lib/ratelimit";
import { requireAndConsumeCredit } from "@/lib/credits";
import { prisma } from "@/lib/prisma";
import { generateImageBase64 } from "@/lib/openai_images";
import { generateVertexImagesBase64 } from "@/lib/vertex_images";

const Body = z.object({
  prompt: z.string().trim().min(1).max(1000),
  provider: z.enum(["openai", "vertex"]).optional().default("openai"),

  // Vertex-only (ignored by OpenAI for now)
  sampleCount: z.number().int().min(1).max(4).optional(),
  aspectRatio: z.enum(["1:1", "3:4", "4:3", "9:16", "16:9"]).optional(),
  negativePrompt: z.string().trim().max(500).optional(),
  personGeneration: z.enum(["allow_all", "allow_adult", "allow_none"]).optional(),
});

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (!xf) return "0.0.0.0";
  return xf.split(",")[0]!.trim();
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(req);

  const [u, i] = await Promise.all([
    userRatelimit.limit(`u:${userId}`),
    ipRatelimit.limit(`ip:${ip}`),
  ]);

  if (!u.success || !i.success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const credit = await requireAndConsumeCredit(userId);
  if (!credit.ok) {
    return NextResponse.json({ error: "No credits. Subscribe to add credits." }, { status: 402 });
  }

  const { prompt, provider } = parsed.data;

  try {
    const images =
      provider === "vertex"
        ? await generateVertexImagesBase64(prompt, {
            sampleCount: parsed.data.sampleCount,
            aspectRatio: parsed.data.aspectRatio,
            negativePrompt: parsed.data.negativePrompt,
            personGeneration: parsed.data.personGeneration,
          })
        : [await generateImageBase64(prompt)];

    await prisma.usageLog.create({
      data: {
        userId: credit.user.id,
        prompt,
      },
    });

    const generation = await prisma.generation.create({
      data: {
        userId: credit.user.id,
        prompt,
        provider,
        image: images[0]!,
      },
    });

    return NextResponse.json({
      images,
      image: images[0],
      remainingCredits: Math.max(0, credit.user.credits),
      generationId: generation.id,
    });
  } catch (e: any) {
    // Refund the credit for failed generations.
    await prisma.user.update({
      where: { id: credit.user.id },
      data: { credits: { increment: 1 } },
    });

    return NextResponse.json(
      { error: e?.message ? String(e.message).slice(0, 400) : "Generation failed" },
      { status: 500 }
    );
  }
}

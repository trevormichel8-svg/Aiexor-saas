import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Returns your app User row (id + clerkId) or null if not signed in.
 */
export async function ensureUser() {
  const { userId } = await auth(); // ✅ IMPORTANT: await
  if (!userId) return null;

  // Your schema: User { id String @id @default(cuid()), clerkId String @unique }
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, clerkId: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { clerkId: userId },
      select: { id: true, clerkId: true },
    });
  }

  return user;
}

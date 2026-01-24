import { prisma } from "./prisma";

export const DEFAULT_FREE_CREDITS = 10;

export async function ensureUser(clerkId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      clerkId,
      credits: DEFAULT_FREE_CREDITS,
    },
  });
}

export async function requireAndConsumeCredit(clerkId: string) {
  const user = await ensureUser(clerkId);
  if (user.credits <= 0) {
    return { ok: false as const, user };
  }

  const updated = await prisma.user.update({
    where: { clerkId },
    data: { credits: { decrement: 1 } },
  });

  return { ok: true as const, user: updated };
}

export async function addCreditsByCustomerId(stripeCustomerId: string, creditsToAdd: number) {
  return prisma.user.update({
    where: { stripeCustomerId },
    data: { credits: { increment: creditsToAdd } },
  });
}

export async function setSubscriptionStatusByCustomerId(stripeCustomerId: string, status: string) {
  return prisma.user.update({
    where: { stripeCustomerId },
    data: { subscriptionStatus: status },
  });
}

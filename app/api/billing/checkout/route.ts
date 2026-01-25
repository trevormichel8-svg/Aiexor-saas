import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/credits";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await ensureUser(userId);

  let customerId = user.stripeCustomerId ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { clerkId: userId },
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { clerkId: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${env.APP_URL}/studio?success=1`,
    cancel_url: `${env.APP_URL}/billing?canceled=1`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}

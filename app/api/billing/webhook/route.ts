import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { addCreditsByCustomerId, setSubscriptionStatusByCustomerId } from "@/lib/credits";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const CREDITS_PER_INVOICE = 200;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const customerId = session.customer as string | null;
        if (customerId) {
          const clerkId = (await stripe.customers.retrieve(customerId) as any).metadata?.clerkId as string | undefined;
          if (clerkId) {
            await prisma.user.upsert({
              where: { clerkId },
              create: { clerkId, stripeCustomerId: customerId, subscriptionStatus: "active", credits: 0 },
              update: { stripeCustomerId: customerId, subscriptionStatus: "active" },
            });
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string | null;
        if (customerId) {
          await addCreditsByCustomerId(customerId, CREDITS_PER_INVOICE);
          await setSubscriptionStatusByCustomerId(customerId, "active");
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        const customerId = sub.customer as string | null;
        const status = sub.status as string | undefined;
        if (customerId && status) {
          await setSubscriptionStatusByCustomerId(customerId, status);
        }
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Webhook handling error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

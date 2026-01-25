import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/studio(.*)",
  "/billing(.*)",
  "/account(.*)",
  "/api/generate(.*)",
  "/api/billing/checkout(.*)"
]);

const isWebhookRoute = createRouteMatcher([
  "/api/billing/webhook(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isWebhookRoute(req)) return;
  if (isProtectedRoute(req)) (auth as any).protect();
});

export const config = {
  matcher: ["/((?!_next|.*\..*).*)", "/api/(.*)"],
};

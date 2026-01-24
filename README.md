# aiexor-saas-starter

A minimal, sellable SaaS starter for an AI image generator:
- Auth: Clerk
- Billing: Stripe subscriptions
- DB: Postgres + Prisma
- Rate limiting: Upstash Redis
- Generation: OpenAI Images API (server-side only)

## Quickstart (local)

1) Install deps
```bash
npm i
```

2) Create env file
```bash
cp .env.example .env
```

3) Set up Postgres + Prisma
```bash
npx prisma generate
npx prisma migrate dev
```

4) Run
```bash
npm run dev
```

Open http://localhost:3000

## Required services

### Clerk
Create a Clerk app and set:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY

### Stripe
Create a subscription product+price and set:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID

### Database (Postgres)
Set:
- DATABASE_URL

### Upstash Redis
Create an Upstash Redis and set:
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

### OpenAI
Set:
- OPENAI_API_KEY

## Deploy (Vercel)

- Add all env vars in Vercel
- Deploy
- In Stripe, create a webhook endpoint:
  - URL: https://YOUR_DOMAIN/api/billing/webhook
  - Events: checkout.session.completed, invoice.paid, customer.subscription.updated, customer.subscription.deleted
  - Copy webhook secret to STRIPE_WEBHOOK_SECRET

## Notes
- Credits are enforced in `/api/generate` (1 credit per generation).
- Default free credits on first sign-in: 10 (config in `lib/credits.ts`).
- Rate limit: 10 req/min/user and 30 req/min/ip fallback.

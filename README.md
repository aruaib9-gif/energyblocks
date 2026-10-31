# Energy Blocks

Marketing site, marketplace (`/shop`) and admin (`/admin`) for Energy Blocks Construction Ltd.
Next.js 16 · MongoDB Atlas · Paystack · Resend.

## Local setup

```bash
npm install
cp .env.example .env.local     # fill in MONGODB_URI at minimum
npm run db:seed                # indexes + sample products (placeholder prices)
npm run dev
```

- Admin: http://localhost:3000/admin — in development any email/password signs in.
- Without `PAYSTACK_SECRET_KEY`, checkout uses a built-in payment simulator.
- Without `RESEND_API_KEY`, emails are printed to the dev server console.

## Deploying to Vercel

1. **MongoDB Atlas:** create a cluster and a database user. In *Network Access*, allow `0.0.0.0/0`
   (Vercel has no fixed IPs). Copy the `mongodb+srv://…` connection string.
2. **Vercel → Settings → Environment Variables:** add every key from `.env.example`.
   `SITE_URL` is your live URL; generate `SESSION_SECRET` with `openssl rand -base64 48`.
3. **Indexes and first admin** (run locally with production values in `.env.local`):
   `npm run db:setup` then `npm run admin:create -- you@energyblocks.com "Your Name"`.
4. **Paystack:** set the webhook URL to `https://YOUR-DOMAIN/api/webhooks/paystack`.
5. **Resend:** verify your sending domain and set `EMAIL_FROM` to an address on it.
6. Redeploy.

## Emails sent

| When | To |
| --- | --- |
| Payment confirmed | Customer (receipt + tracking link) and `ADMIN_NOTIFY_EMAIL` |
| Admin changes delivery status | Customer (with courier, tracking number and note) |

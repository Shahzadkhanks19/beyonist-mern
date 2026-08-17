# Beyonist MERN

Production-grade ecommerce platform for Beyonist.

## Structure

- `client/` — React + Vite storefront, customer dashboard and admin dashboard
- `server/` — Express + MongoDB API, authentication, commerce, reviews, email and realtime services

## Local development

```bash
cd server
npm install
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

## Production

Environment secrets are intentionally excluded from Git. Use the `.env.example` files as references and configure production values in the hosting provider.

Before deployment:

```bash
cd server
npm run check
```

```bash
cd ../client
npm run check
```

## Security

Never commit `.env`, MongoDB credentials, JWT/session secrets, Razorpay secrets, Resend keys or other production credentials.

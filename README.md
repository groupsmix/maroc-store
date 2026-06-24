# jumlaop-store

Public storefront for JumlaOP — product catalog, stock, pricing, and descriptions.

Deployed to Cloudflare Workers Static Assets.

## Development

```bash
pnpm install
pnpm dev       # local dev server
pnpm build     # production build
```

## Deploy

Automatically deployed to Cloudflare via GitHub Actions on push to `main`.

Manual deploy:
```bash
pnpm exec wrangler deploy --env production
```

## Stack

- Vite (build tool)
- Cloudflare Workers Static Assets (hosting)
- GitHub Actions (CI/CD)

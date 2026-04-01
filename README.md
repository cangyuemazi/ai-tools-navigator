# AI Tools Navigator

Language: [中文](./README.zh-CN.md) | [English](./README.en.md) | [日本語](./README.ja.md)

AI Tools Navigator is a full-stack AI tools directory website built with React, Vite, Express, Prisma, and MySQL. It combines a public-facing discovery experience, a user submission flow, and an admin console for review, publishing, category management, and site-wide branding.

This repository currently includes:

- A public directory with category browsing, all-tools view, and searchable tool cards
- A submission page for new tool recommendations, including logo upload and contact info
- An admin panel for approving pending submissions, managing tools, sorting categories, and editing site settings
- A Prisma-backed data layer with upload handling, rate limiting, and basic security hardening

Choose a detailed README on GitHub:

| Language | File | Focus |
| --- | --- | --- |
| Chinese | [README.zh-CN.md](./README.zh-CN.md) | Full product overview, setup, routes, API, operations |
| English | [README.en.md](./README.en.md) | Full project overview, setup, routes, API, operations |
| Japanese | [README.ja.md](./README.ja.md) | Full project overview, setup, routes, API, operations |

Quick start:

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm dev
```

Default local addresses:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Admin: http://localhost:3000/admin

Core stack:

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI, Framer Motion
- Backend: Express 4, Prisma 6, MySQL, Multer
- Security: helmet, express-rate-limit, xss

License: MIT
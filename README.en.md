# AI Tools Navigator

Language: [中文](./README.zh-CN.md) | [English](./README.en.md) | [日本語](./README.ja.md)

## Overview

AI Tools Navigator is a full-stack template for building an AI tools directory website. It combines a public catalog, a user submission flow, an admin review console, category management, site-wide branding settings, and a Prisma-backed data layer in one repository.

This is not just a static landing page. The current implementation is a database-driven application: the frontend reads categories, tools, and site settings from API endpoints, while the admin console manages publishing, review, ordering, and legal or branding content.

## What the current codebase provides

### Public site

- Home page with category-based browsing
- Dedicated all-tools view at `/all-tools`
- Tool ordering based on sponsored status, manual order value, then view count
- Category tree loaded from the backend and sorted by `order`
- Persistent shell pattern for non-admin routes so navigation state is more stable

### Submission flow

- Public submission page at `/submit`
- Logo upload support through a public upload endpoint
- Submission fields for logo, name, description, URL, contact info, category, and subcategory
- New submissions are stored in `PendingTool` and require admin approval before publication
- Strict rate limiting on tool submissions

### Admin console

- Admin entry point at `/admin`
- Password-based Bearer authentication using `ADMIN_PASSWORD`
- Dashboard with tool counts, pending counts, recent growth, category distribution, and top tools
- Review queue for pending submissions
- CRUD for tools
- CRUD for categories
- Reordering for top-level categories and sibling subcategories
- Site settings for name, logo, favicon, title size, background color, footer info, terms text, and privacy text

### Backend safeguards

- `helmet` security headers
- Global API rate limiting
- Extra rate limiting for public submissions
- Basic `xss` sanitization for submitted content
- Upload size limit of 5 MB

## Routes

### Public routes

- `/`
- `/all-tools`
- `/submit`
- `/about`
- `/partners`
- `/terms`
- `/privacy`

### Admin route

- `/admin`

## Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Radix UI style components
- Framer Motion
- Wouter

### Backend

- Express 4
- Prisma 6
- MySQL
- Multer

### Supporting libraries

- Recharts
- React Hook Form
- Zod
- helmet
- express-rate-limit
- xss

## Repository structure

```text
.
├─ client/                  # Vite frontend root
│  ├─ public/               # Static assets and uploaded files
│  └─ src/
│     ├─ components/
│     ├─ contexts/
│     ├─ data/
│     ├─ hooks/
│     ├─ pages/
│     ├─ types/
│     └─ App.tsx
├─ server/                  # Express API server
├─ prisma/                  # Prisma schema and migrations
├─ scripts/                 # Helper scripts such as seed
├─ shared/                  # Shared constants
└─ vite.config.ts           # Vite config, root points to client/
```

## Data model summary

The main tables are:

- `Tool`
- `Category`
- `PendingTool`
- `SiteSetting`

Important business fields:

- `Tool.isSponsored`: sponsored placement flag
- `Tool.order`: manual ranking weight
- `Tool.views`: popularity signal used in sorting
- `Category.order`: display order for categories
- `PendingTool.categoryId` and `PendingTool.subCategoryId`: submission classification data

## Local development

### Requirements

- Node.js 18+
- pnpm
- MySQL

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create `.env`

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/ai_tools_navigator"
ADMIN_PASSWORD="change-this-password"
PORT="3001"
```

Optional frontend variables:

- `VITE_FRONTEND_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_OAUTH_PORTAL_URL`
- `VITE_APP_ID`

### 3. Prepare the database

To apply the existing migrations:

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

For a quick local schema sync:

```bash
pnpm prisma generate
pnpm prisma db push
```

Optional seed:

```bash
pnpm exec tsx scripts/seed.ts
```

### 4. Start development servers

```bash
pnpm dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Admin: `http://localhost:3000/admin`

`pnpm dev` starts both:

- `vite --host`
- `tsx watch server/index.ts`

## API summary

### Public endpoints

- `GET /api/settings`
- `GET /api/categories`
- `GET /api/tools`
- `POST /api/upload-public`
- `POST /api/submit-tool`

### Admin endpoints

- `POST /api/admin/login`
- `POST /api/admin/upload`
- `PUT /api/admin/settings`
- `GET /api/admin/tools`
- `POST /api/admin/tools`
- `PUT /api/admin/tools/:id`
- `DELETE /api/admin/tools/:id`
- `GET /api/admin/pending-tools`
- `DELETE /api/admin/pending-tools/:id`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `POST /api/admin/categories/reorder`

Admin requests use:

```http
Authorization: Bearer <ADMIN_PASSWORD>
```

## Suggested operating flow

1. Configure categories and site branding in the admin console.
2. Let users submit tools from `/submit`.
3. Review pending submissions in the admin queue.
4. Publish approved tools with tags, ranking weight, and sponsored status.
5. Let the public site render tools using the built-in sorting rules.

## Notes

- The live app is API and database driven, not purely JSON driven.
- The repository still contains some local sample data and older supporting documents, so treat the current source code and Prisma schema as the source of truth.
- The current package scripts cover development and frontend build. If you deploy a combined production server, you will likely want to add your own backend start command and static asset publishing flow.

## Verified commands

```bash
pnpm exec tsc --noEmit
pnpm build
```

## License

MIT
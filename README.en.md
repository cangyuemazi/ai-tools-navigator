<div align="center">

# 🧭 AI Tools Navigator

**Full-Stack AI Tools Directory · 全栈 AI 工具导航站 · フルスタック AI ツールナビ**

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](#tech-stack)
[![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](#tech-stack)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#tech-stack)
[![Prisma 6](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](#tech-stack)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](#tech-stack)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](#tech-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](#docker-deployment)

<br />

**English** · [中文](README.md) · [日本語](README.ja.md)

<br />

<em>An all-in-one AI tools directory solution — from setup to operations, ready out of the box.</em>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Use Cases](#use-cases)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [API Reference](#api-reference)
- [Operations Workflow](#operations-workflow)
- [Security](#security)
- [FAQ](#faq)
- [License](#license)

---

## Overview

AI Tools Navigator is an **open-source full-stack template** for building AI tool directory websites. It integrates a public catalog, user submissions, admin review workflow, category management, site branding, and security hardening — all in a single repository.

This is not a static site — the frontend dynamically fetches categories, tools, and site settings via API; the admin console manages reviews, publishing, category ordering, branding, and legal content.

### Key Highlights

- 🎨 **Apple-style UI** — Rounded cards, frosted glass nav bars, smooth animations — premium design out of the box
- 📱 **Responsive Design** — Fully adaptive from mobile to 4K; collapsible sidebar with drag-to-resize
- 🔍 **Instant Search** — Pinyin matching and keyword search; Command Palette (`Ctrl+K`) for quick access
- 📊 **Rich Admin Console** — Dashboard, review center, batch operations, Excel import/export
- 🛡️ **Production-grade Security** — JWT auth, rate limiting, XSS filtering, Helmet headers, MIME verification
- ☁️ **Flexible Storage** — Local uploads or Alibaba Cloud OSS, switchable via env vars
- 🐳 **One-click Deploy** — Docker Compose + Nginx reverse proxy, production-ready

---

## Use Cases

- AI tool directories / resource catalogs / product listing sites
- Open user submissions with admin review before publishing
- Sponsored placement + manual ranking + view-count-based sorting
- Non-developers maintaining categories, tools, and site content

---

## Features

### 🌐 Public Site

| Feature | Description |
|---------|-------------|
| Category Browsing | Home page organizes tool cards by category/subcategory with tab switching |
| All Tools | Dedicated `/all-tools` view for the complete catalog |
| Smart Sorting | Sponsored → manual order score → view count |
| Search | Pinyin & keyword search, Command Palette (`Ctrl+K`) |
| Tool Submissions | `/submit` — self-service submission with logo upload |
| Sponsored Showcase | Horizontal scrolling sponsor section at the top of the home page |
| About Us | `/about` — Markdown-editable from admin, rendered as rich text |
| Partnerships | `/partners` — same Markdown editing capability |
| Terms & Privacy | `/terms`, `/privacy` — editable from admin panel |
| Customer Service | Floating QR code widget, configurable from admin |
| Lazy Loading | Tool card images use `loading="lazy"` |
| Code Splitting | Admin/Terms/Privacy loaded on demand via `React.lazy` |

### 🔧 Admin Console `/admin`

| Feature | Description |
|---------|-------------|
| Dashboard | Tool count, pending count, weekly/monthly growth, category distribution chart, Top 10 |
| Review Center | View submissions, one-click import to publish form |
| Tool Management | Full CRUD + batch sponsor/batch delete |
| Batch Import | Download Excel template → fill in → upload for bulk import |
| Batch Image Upload | Upload multiple images at once |
| Category Management | Parent/child CRUD + drag-to-reorder |
| Site Settings | Name, logo, favicon, background color, title font size, footer, legal texts |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript 5, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion, Wouter |
| **Backend** | Express 4, Prisma 6, MySQL 8, Multer, jsonwebtoken |
| **Security** | helmet, express-rate-limit, xss, crypto (timingSafeEqual) |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **File Storage** | Local disk / Alibaba Cloud OSS (optional) |
| **Excel** | ExcelJS (template export), XLSX (batch import parsing) |
| **Markdown** | md-editor-rt (admin editor), react-markdown + rehype-raw + DOMPurify (frontend rendering) |
| **Deployment** | Docker, Nginx, Node.js 20 |

---

## Project Structure

```
ai-tools-navigator/
├── client/                         # Frontend (Vite + React)
│   ├── index.html                  # HTML entry
│   ├── public/
│   │   └── uploads/                # Local upload storage
│   └── src/
│       ├── App.tsx                  # Router entry (React.lazy code splitting)
│       ├── main.tsx                # React mount point
│       ├── components/
│       │   ├── AppShell.tsx        # Persistent shell (avoids sidebar re-render)
│       │   ├── Layout.tsx          # Main layout (sidebar + top bar + content)
│       │   ├── Sidebar.tsx         # Sidebar (category nav, collapse, drag-resize)
│       │   ├── ToolCard.tsx        # Tool card component
│       │   ├── ToolGrid.tsx        # Tool grid layout
│       │   ├── CommandPalette.tsx   # Command Palette search panel
│       │   ├── FloatingWidgets.tsx  # Floating CS widget / back-to-top
│       │   ├── MarkdownEditor.tsx   # Markdown editor wrapper
│       │   └── ui/                 # Radix-based UI component library
│       ├── contexts/               # React Context
│       ├── hooks/                  # Custom Hooks
│       ├── lib/                    # Utilities + site settings cache
│       ├── pages/
│       │   ├── Home.tsx            # Home / All Tools (dual mode)
│       │   ├── Admin.tsx           # Admin entry
│       │   ├── Submit.tsx          # Tool submission page
│       │   ├── About.tsx           # About Us
│       │   ├── Partners.tsx        # Partnerships
│       │   ├── Terms.tsx           # Terms of Service
│       │   ├── Privacy.tsx         # Privacy Policy
│       │   └── admin/              # Admin sub-components
│       │       ├── Dashboard.tsx   # Analytics dashboard
│       │       ├── PendingTools.tsx # Review center
│       │       ├── Tools.tsx       # Tool management
│       │       ├── Categories.tsx  # Category management
│       │       └── Settings.tsx    # Site settings
│       └── types/                  # TypeScript type definitions
├── server/
│   └── index.ts                    # Express API + all routes
├── shared/
│   └── const.ts                    # Shared constants (frontend + backend)
├── prisma/
│   ├── schema.prisma               # Data models + index definitions
│   └── migrations/                 # Database migration files
├── scripts/
│   └── seed.ts                     # Database seed script
├── nginx/
│   └── default.conf                # Nginx reverse proxy + security headers + caching
├── Dockerfile                      # Multi-stage build
├── docker-compose.yml              # Docker Compose orchestration
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json
```

---

## Data Models

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **Tool** | Published tools | name, url, logo, description, categoryId, subCategoryId, tags (JSON), views, order, isSponsored, sponsorExpiry |
| **Category** | Categories | name, parentId (hierarchy), icon, order |
| **PendingTool** | Pending submissions | name, url, logo, contactInfo, categoryId, subCategoryId, status |
| **SiteSetting** | Global configuration | name, logo, favicon, backgroundColor, titleFontSize, companyIntro, icp, email, customerServiceQrCode, termsText, privacyText, aboutContent, partnersContent |

### Index Strategy

```
Tool:         @@index([categoryId])
              @@index([subCategoryId])
              @@index([isSponsored, order, views])   -- Composite index for homepage sorting
              @@index([createdAt])

Category:     @@index([parentId])

PendingTool:  @@index([status])
              @@index([createdAt])
```

---

## Quick Start

### Prerequisites

| Dependency | Minimum Version |
|------------|----------------|
| Node.js | >= 18 |
| pnpm | >= 8 |
| MySQL | >= 5.7 |

### 1. Clone & Install

```bash
git clone https://github.com/your-org/ai-tools-navigator.git
cd ai-tools-navigator
pnpm install
```

### 2. Configure Environment

Create a `.env` file (see [Environment Variables](#environment-variables)):

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ai_tools_dev"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret-string"
PORT=3001
```

### 3. Initialize Database

```bash
# Generate Prisma Client
pnpm prisma generate

# Sync schema (recommended for development)
pnpm prisma db push

# Or apply existing migrations (recommended for production)
pnpm prisma migrate deploy
```

Optional — seed example data:

```bash
pnpm exec tsx scripts/seed.ts
```

### 4. Start Development

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Admin Console | http://localhost:3000/admin |

### 5. Production Build

```bash
pnpm build                   # Vite frontend build
pnpm exec tsc --noEmit       # TypeScript type check (optional)
```

---

## Environment Variables

Create a `.env` file in the project root:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | MySQL connection string | `mysql://root:pass@localhost:3306/ai_tools` |
| `ADMIN_PASSWORD` | Yes | Admin panel login password | `my-strong-password-123` |
| `JWT_SECRET` | Recommended | JWT signing secret (random on each restart if not set) | See generation command below |
| `PORT` | No | Server port | `3001` (default) |
| `OSS_ACCESS_KEY_ID` | No | Alibaba Cloud OSS Access Key ID | — |
| `OSS_ACCESS_KEY_SECRET` | No | Alibaba Cloud OSS Access Key Secret | — |
| `OSS_BUCKET` | No | Alibaba Cloud OSS bucket name | `my-ai-tools` |
| `OSS_REGION` | No | Alibaba Cloud OSS region | `oss-cn-beijing` (default) |

> **Storage note**: When OSS environment variables are not configured, uploads are stored locally in `client/public/uploads/`. OSS storage is activated automatically when configured.

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Docker Deployment

The project includes a complete Docker setup with multi-stage Dockerfile and Docker Compose orchestration.

### Architecture

```
┌──────────┐         ┌──────────────┐         ┌───────┐
│  Client  │  :80 →  │    Nginx     │  :3001 → │ Node  │ → MySQL
│          │         │ (proxy+cache)│         │ (API) │
└──────────┘         └──────────────┘         └───────┘
```

### One-click Start

```bash
# Ensure .env is configured (DATABASE_URL must point to an accessible MySQL instance)
docker compose up -d --build
```

### Nginx Features

- 🔒 Security headers (X-Frame-Options, CSP, X-Content-Type-Options, etc.)
- 📦 Gzip compression
- ⏱️ Long-term caching for static assets (365 days for Vite-hashed `/assets/`)
- 🔄 Reverse proxy to Node.js backend

---

## API Reference

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/settings` | Fetch site settings |
| `GET` | `/api/categories` | Fetch category tree |
| `GET` | `/api/tools` | Tool list (supports pagination `?page=1&limit=50`) |
| `POST` | `/api/upload-public` | Public image upload (rate limited) |
| `POST` | `/api/submit-tool` | Submit tool for review (rate limited) |

### Admin Endpoints (JWT Required)

All admin endpoints require the header:

```
Authorization: Bearer <jwt_token>
```

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/login` | Login to obtain JWT token |
| `POST` | `/api/admin/upload` | Admin image upload |
| `POST` | `/api/admin/upload-batch` | Batch image upload (max 100) |
| `PUT` | `/api/admin/settings` | Update site settings |
| `GET` | `/api/admin/tools` | List all tools |
| `POST` | `/api/admin/tools` | Create tool |
| `PUT` | `/api/admin/tools/:id` | Update tool |
| `DELETE` | `/api/admin/tools/:id` | Delete tool |
| `GET` | `/api/admin/tools/template` | Download Excel import template |
| `POST` | `/api/admin/tools/batch-import` | Batch import tools from Excel |
| `GET` | `/api/admin/pending-tools` | List pending submissions |
| `DELETE` | `/api/admin/pending-tools/:id` | Delete pending submission |
| `POST` | `/api/admin/categories` | Create category |
| `PUT` | `/api/admin/categories/:id` | Update category |
| `DELETE` | `/api/admin/categories/:id` | Delete category (cascades children) |
| `POST` | `/api/admin/categories/reorder` | Reorder categories |

---

## Operations Workflow

```
┌─────────────────────────────────────────┐
│  Admin configures categories & settings  │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│  Users submit tools at /submit           │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│  Submissions enter review queue          │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│  Admin reviews → adds tags/rank → publish│
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│  Public site auto-sorts:                 │
│  Sponsored > Order score > View count    │
└─────────────────────────────────────────┘
```

---

## Security

| Layer | Measure | Description |
|-------|---------|-------------|
| **Auth** | JWT Token | Admin endpoints require valid token, 24h expiry |
| **Password** | SHA-256 + timingSafeEqual | Timing-attack-resistant password comparison |
| **Rate Limiting** | Global | 300 requests per IP per 15 minutes |
| | Login | 10 attempts per IP per 15 minutes |
| | Submissions | 5 per IP per hour |
| | Public uploads | 20 per IP per 15 minutes |
| **Input** | XSS Filtering | All write endpoints sanitized via `xss()` |
| **Uploads** | MIME Whitelist | Only `jpg/png/gif/webp/svg/ico` allowed |
| | Magic Bytes Validation | File header verification to prevent MIME spoofing |
| | Randomized Filenames | UUID-based naming prevents path traversal and enumeration |
| **HTTP** | Helmet | Security headers, hides server fingerprint |
| | Nginx CSP | Content-Security-Policy enforcement |
| **Errors** | Safe Responses | 500 errors never expose stack traces or internal details |
| | Global Handler | Express error middleware catches unhandled exceptions |

---

## FAQ

<details>
<summary><strong>Q: How do I change the admin password?</strong></summary>

Edit `ADMIN_PASSWORD` in your `.env` file and restart the server. No database changes needed.

</details>

<details>
<summary><strong>Q: How do I switch to Alibaba Cloud OSS storage?</strong></summary>

Add `OSS_ACCESS_KEY_ID`, `OSS_ACCESS_KEY_SECRET`, and `OSS_BUCKET` to your `.env` file, then restart. The system switches automatically — no code changes required.

</details>

<details>
<summary><strong>Q: Database migration errors?</strong></summary>

```bash
# Regenerate Prisma Client
pnpm prisma generate

# Force sync schema (destroys data — development only)
pnpm prisma db push --force-reset

# Or create a new migration
pnpm prisma migrate dev --name describe_your_change
```

</details>

<details>
<summary><strong>Q: How to generate a secure JWT_SECRET?</strong></summary>

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

</details>

<details>
<summary><strong>Q: How to connect MySQL in Docker deployment?</strong></summary>

If MySQL runs on the host machine, use `host.docker.internal` instead of `localhost` in your `DATABASE_URL`:

```env
DATABASE_URL="mysql://root:pass@host.docker.internal:3306/ai_tools"
```

The `docker-compose.yml` already includes the `extra_hosts` mapping.

</details>

<details>
<summary><strong>Q: Where are uploaded images stored?</strong></summary>

- **Local mode** (default): `client/public/uploads/`
- **OSS mode**: In the configured Alibaba Cloud OSS bucket under the `uploads/` path

</details>

---

## License

[MIT](LICENSE)

---

<div align="center">
<sub>Built with ❤️ using React, Express, Prisma & Tailwind CSS</sub>
</div>

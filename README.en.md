<div align="center">

# AI Tools Navigator

**English / 中文 / 日本語**

A production-ready full-stack template for building and operating an AI tools directory, with public pages, user submissions, admin review, category management, batch import, image upload, site settings, and Docker deployment included.

[README.zh](README.md) · [README.en](README.en.md) · [README.ja](README.ja.md)

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](#tech-stack)
[![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](#tech-stack)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#tech-stack)
[![Prisma 6](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white)](#tech-stack)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](#tech-stack)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](#deployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](#license)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [License](#license)

---

## Overview

`AI Tools Navigator` is a full-stack template for AI tools directory websites. It includes a complete operations workflow instead of just a static catalog: public tool listing, user submissions, admin review and publishing, category management, batch image upload, Excel import, editable site content, and Docker deployment.

Current highlights include:

- A dedicated featured tools section on the homepage
- Standard category sections limited to 2 rows by default, with expand/collapse
- Search placeholder text set to `Ctrl+K 全局搜索`
- One tool can belong to multiple main/subcategory combinations
- Canonical deduplication based on `name + description + normalized URL + logo`
- A single canonical tool record in admin management
- OSS-friendly image upload and Excel import flow

---

## Core Features

- Public homepage with category navigation, all-tools page, and command palette search
- User submission flow with admin review queue
- Admin CRUD for tools, featured status, and categories
- Multi-category assignment per tool with automatic frontend/backend sync
- Excel-template-based batch import
- Local or OSS-based image upload
- Editable About, Partners, Terms, and Privacy pages from admin
- Docker + Compose deployment support

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript 5, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion, Wouter |
| Backend | Express 4, Prisma 6, MySQL 8, Multer, jsonwebtoken |
| Security | helmet, express-rate-limit, xss |
| Content | md-editor-rt, react-markdown, rehype-raw, DOMPurify |
| File Storage | Local uploads or Alibaba Cloud OSS |
| Data Import | ExcelJS, XLSX |
| Deployment | Docker, Docker Compose, Nginx, Node.js 20 |

---

## Project Structure

```text
ai-tools-navigator/
├─ client/                  # Frontend
│  ├─ public/
│  │  └─ uploads/           # Local fallback upload directory
│  └─ src/
│     ├─ components/        # Shared UI components
│     ├─ pages/             # Public pages and admin entry
│     ├─ lib/               # Utilities and settings helpers
│     └─ types/             # TypeScript types
├─ server/
│  └─ index.ts              # Express API server
├─ prisma/
│  ├─ schema.prisma         # Prisma schema
│  └─ migrations/           # SQL migrations
├─ nginx/                   # Nginx config
├─ Dockerfile
├─ docker-compose.yml
└─ README.en.md
```

---

## Quick Start

### 1. Install

```bash
pnpm install
```

### 2. Configure `.env`

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/ai_tools_dev"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret"
PORT=3001
NODE_ENV=development
```

If you use Alibaba Cloud OSS, also configure:

```env
OSS_REGION=oss-cn-beijing
OSS_ACCESS_KEY_ID=your-key-id
OSS_ACCESS_KEY_SECRET=your-key-secret
OSS_BUCKET=your-bucket
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Start Development

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Admin: `http://localhost:3000/admin`

### 5. Build

```bash
npm run build
```

---

## Environment Variables

Production should define at minimum:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV=production`

If OSS is not configured, uploads fall back to `client/public/uploads/`.

---

## Deployment

### Docker

```bash
docker compose up -d --build
```

### Production Notes

- `ADMIN_PASSWORD` and `JWT_SECRET` are required in production
- `NODE_ENV` must be `production`
- Back up the database before deployment
- If you rely on local upload fallback, make sure storage is persisted

---

## Security Notes

- Admin APIs are protected with JWT
- Login, submission, and public upload endpoints are rate-limited
- Text inputs are sanitized against XSS
- SVG upload is disabled to reduce upload attack surface
- Production startup fails fast if critical secrets are missing

---

## License

MIT

---

<div align="center">
Built with React, Express, Prisma, MySQL, and Tailwind CSS.
</div>

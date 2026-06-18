# BuildUp — Production Deployment Guide

## Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm

## Quick Start

```bash
cp .env.example .env.local
# Edit .env.local with your DB credentials and secrets

npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | Yes | MySQL host |
| `DB_PORT` | No | MySQL port (default 3306) |
| `DB_USER` | Yes | MySQL user |
| `DB_PASSWORD` | Yes | MySQL password |
| `DB_NAME` | Yes | MySQL database name |
| `NEXTAUTH_URL` | Yes | App URL (http://localhost:3000) |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `WABLAS_TOKEN` | No | Wablas device token |
| `WABLAS_SECRET_KEY` | No | Wablas secret key |

## Database Setup

```sql
CREATE DATABASE IF NOT EXISTS buildup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run migration:
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' src/lib/db/migrate.ts
```

## Deployment

### Vercel (Frontend)
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### cPanel (Backend/Full-stack)
1. Upload entire project to cPanel
2. Create MySQL database
3. Run `npm install && npm run build`
4. Start with `npm start` (or PM2: `pm2 start npm -- start`)

## Security Checklist
- [ ] Change NEXTAUTH_SECRET to random 64-char string
- [ ] Set strong MySQL password
- [ ] Enable HTTPS
- [ ] Set CSP headers in production (remove unsafe-inline)
- [ ] Configure rate limiting (Redis in production)
- [ ] Set up database backups
- [ ] Review file upload permissions

## Performance
- Enable MySQL query cache
- Use Vercel Edge Network for static assets
- Enable gzip/brotli compression

## Monitoring
- Check `/api/admin/stats` for system health
- Monitor MySQL slow query log
- Set up error alerting (Sentry, etc.)

# 🏪 Shivam Traders — Billing & Invoice App

A full-stack **Next.js 14 + PostgreSQL** GST billing and invoice management system.

## ✨ Features

- **Dashboard** — Revenue stats, monthly chart, recent invoices
- **Products** — Add/Edit/Delete product catalogue with HSN codes & GST rates
- **Invoices** — Create invoices by selecting products from dropdown
- **GST Calculation** — Auto CGST+SGST (intrastate) or IGST (interstate)
- **PDF Download** — Download invoices as professional A4 PDF
- **Status Management** — Track Draft / Unpaid / Paid / Overdue
- **Full-Stack** — Next.js API Routes as backend + PostgreSQL via Prisma ORM

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes (REST) |
| Database | PostgreSQL + Prisma ORM |
| PDF | html2pdf.js |
| Notifications | react-hot-toast |

---

## 🚀 Quick Start

### Step 1 — Prerequisites

- Node.js 18+
- PostgreSQL installed locally **OR** a cloud DB (Neon, Supabase, Railway)

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Setup Database

**Option A: Local PostgreSQL**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE billing_db;"
```

**Option B: Free Cloud DB (Neon — recommended)**
1. Go to [neon.tech](https://neon.tech) → Create free account
2. Create project → Copy connection string

### Step 4 — Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_vW0UAg4atrVD@ep-flat-night-anp3qnoa-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Step 5 — Run Migrations & Seed

```bash
# Push schema to database
npm run db:push

# Seed with sample products (optional)
npm run db:seed
```

### Step 6 — Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
billing-app/
├── prisma/
│   ├── schema.prisma        ← Database schema (Product, Invoice, InvoiceItem)
│   └── seed.ts              ← Sample data seeder
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/    ← GET /api/products, POST /api/products
│   │   │   │   └── [id]/    ← GET/PUT/DELETE /api/products/:id
│   │   │   ├── invoices/    ← GET /api/invoices, POST /api/invoices
│   │   │   │   └── [id]/    ← GET/PUT/DELETE /api/invoices/:id
│   │   │   └── dashboard/   ← GET /api/dashboard (stats)
│   │   ├── dashboard/       ← Dashboard page
│   │   ├── products/        ← Products CRUD page
│   │   ├── invoices/
│   │   │   ├── page.tsx     ← Invoices list
│   │   │   ├── new/         ← Create invoice
│   │   │   └── [id]/        ← Invoice detail + PDF
│   │   ├── layout.tsx       ← Root layout with sidebar
│   │   └── globals.css      ← Global styles
│   ├── components/
│   │   ├── Sidebar.tsx      ← Navigation sidebar
│   │   └── InvoiceTemplate.tsx ← PDF invoice HTML template
│   └── lib/
│       ├── prisma.ts        ← Prisma client singleton
│       ├── api.ts           ← Frontend API fetch helpers
│       └── types.ts         ← TypeScript interfaces
```

---

## 🌐 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get one product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List all invoices |
| GET | `/api/invoices?status=PAID` | Filter by status |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices/:id` | Get invoice with items |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Stats + monthly revenue |

---

## ☁️ Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard:
# Settings → Environment Variables → Add DATABASE_URL
```

### Recommended Cloud DBs (free tier):
- **[Neon](https://neon.tech)** — Serverless PostgreSQL, 0.5GB free
- **[Supabase](https://supabase.com)** — PostgreSQL, 500MB free
- **[Railway](https://railway.app)** — PostgreSQL, $5 free credits

---

## 🗄 Database Commands

```bash
npm run db:push      # Apply schema changes (dev)
npm run db:migrate   # Create migration files (prod)
npm run db:studio    # Open Prisma Studio (GUI)
npm run db:seed      # Seed sample products
```

---

## 🧾 GST Logic

- **Intrastate**: CGST = SGST = GST Rate / 2
- **Interstate**: IGST = Full GST Rate
- Supported rates: 0%, 5%, 12%, 18%, 28%
- Invoice numbers auto-generated: `ST-2025-0001`

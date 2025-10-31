# Domari - Rental Property Investment Tracker

Domari is a simple, powerful **property investment tracker** designed specifically for landlords and property investors. We eliminate spreadsheet chaos by providing an intuitive platform to **track rental income, expenses, and understand your investment performance** — all in one place.

## 🏗 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM (Supabase)
- **Authentication**: NextAuth.js v5 with Google OAuth and credentials
- **UI**: TailwindCSS v4 + shadcn/ui + Radix UI primitives
- **Storage**: Supabase Storage
- **Validation**: Zod schemas
- **Forms**: react-hook-form with Zod resolvers
- **Hosting**: Vercel

## 🚀 Quick Start (Development)

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Supabase recommended)

### 1. Clone and Install

```bash
git clone <repository-url>
cd property-management-app/client
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local and fill in your actual values
# See .env.example for detailed descriptions of each variable
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with categories and currencies
npm run db:seed

# (Optional) Open database browser
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

### Development

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build application for production
- `npm run start` - Start production server
- `npm run lint` - Lint code with ESLint
- `npx prettier --write .` - Format code with Prettier

### Database Operations

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to dev DB
- `npm run db:migrate -- --name migration_name` - Create new migration
- `npm run db:studio` - Open Prisma Studio (database browser)
- `npm run db:seed` - Seed database with property categories

### shadcn/ui Components

- `npx shadcn@latest add [component-name]` - Add new shadcn/ui component

## Development Workflow

### Database Changes

**⚠️ Important:** Always ask before running migrations in shared environments.

1. Modify Prisma schema in `/prisma/schema.prisma`
2. Generate Prisma client: `npm run db:generate`
3. For development:
   - Quick iteration: `npm run db:push` (no migration file created)
   - Formal migration: `npm run db:migrate -- --name descriptive_name`
4. Test changes locally with `npm run db:studio`
5. For production: `npm run db:migrate:deploy`

### Adding Features

1. Create feature branch from `master`
2. Develop using established patterns (see [CLAUDE.md](../CLAUDE.md))
3. Use shadcn/ui components: `npx shadcn@latest add [component]`
4. Validate inputs with Zod schemas
5. Test functionality locally: `npm run dev`
6. Build test: `npm run build && npm run lint`
7. Create pull request to `master`

## 🚀 Production Deployment

### Vercel Deployment (Recommended)

**Prerequisites:**

- Vercel account
- Production database (Supabase)
- All environment variables configured

**Environment Variables for Production:**
Set these in your Vercel dashboard or deployment platform. Use `.env.example` as reference for all required variables with production-appropriate values.

**Deployment Steps:**

1. **Build Test Locally**

   ```bash
   npm run build
   npm run lint
   ```

2. **Database Migration**

   ```bash
   # Apply migrations to production
   npm run db:migrate:deploy

   # If this is first deploy or schema was created with db:push, baseline the migration:
   npm run db:migrate:resolve "20251010_init"

   # Then run deploy again:
   npm run db:migrate:deploy
   ```

3. **Apply RLS Policies (First Deploy Only)**

   Row Level Security policies must be applied manually via Supabase Dashboard:

   ```bash
   # 1. Open Supabase Dashboard → SQL Editor
   # 2. Copy contents of prisma/migrations/rls-policies.sql
   # 3. Paste and execute in SQL Editor
   ```

4. **Seed Database (First Deploy Only)**

   ```bash
   # Seed categories, currencies, and timezones
   npm run db:seed:prod
   ```

5. **Deploy via Dashboard**

   - Push changes to `master` branch
   - Vercel auto-deploys from connected GitHub repository

6. **Deploy via CLI (Optional)**

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login and link project
   vercel login
   vercel link

   # Deploy to production
   vercel --prod
   ```

### Post-Deployment Checklist

- ✅ Test authentication flow (Google OAuth + credentials)
- ✅ Verify database connections work
- ✅ Test image uploads to Supabase Storage
- ✅ Check all API routes function correctly
- ✅ Monitor application logs for errors

## Project Structure

```
client/
├── src/
│   ├── app/                      # App Router pages
│   │   ├── (auth)/              # Authentication pages (login, signup)
│   │   ├── (nondashboard)/      # Public pages (landing, contact, legal)
│   │   ├── dashboard/           # Protected dashboard pages
│   │   │   ├── page.tsx         # Overview dashboard
│   │   │   ├── analytics/       # Analytics & reporting
│   │   │   ├── properties/      # Property management
│   │   │   ├── transactions/    # Transaction tracking
│   │   │   └── settings/        # User & billing settings
│   │   └── api/                 # API routes
│   │       ├── auth/           # NextAuth.js endpoints
│   │       ├── billing/        # Stripe webhooks & portal
│   │       ├── properties/     # Property CRUD
│   │       ├── transactions/   # Transaction CRUD
│   │       └── analytics/      # Analytics endpoints
│   ├── components/              # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── landing/            # Landing page sections
│   │   ├── billing/            # Subscription components
│   │   ├── properties/         # Property components
│   │   └── transactions/       # Transaction components
│   ├── lib/                     # Utilities and configurations
│   │   ├── db/                 # Database query functions
│   │   ├── services/           # API service functions
│   │   ├── stripe/             # Stripe integration
│   │   ├── validations/        # Zod validation schemas
│   │   └── utils/              # Helper utilities
│   ├── hooks/                   # React hooks
│   └── types/                   # TypeScript type definitions
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma           # Prisma schema
│   ├── seed.ts                 # Database seeding script
│   └── migrations/             # Migration files
├── public/                      # Static assets (images, fonts)
├── scripts/                     # Utility scripts
└── package.json                # Dependencies and scripts
```

## Key Features

### Core Functionality

- **Property Investment Tracking**: Add, edit, and track rental properties with images
- **Investment Analytics**: Monitor ROI, cash flow trends, expense breakdowns, and property performance comparison
- **Transaction Tracking**: Record income and expenses with pre-built categories
- **CSV Export**: Export transactions for tax preparation and accounting
- **Recent Activity Feed**: Track all changes across your investment portfolio

### Financial Features

- **Multi-Currency Support**: EUR, USD, GBP, AUD, CAD, CHF with automatic formatting
- **Real-Time Calculations**: Cash flow, ROI, expense ratios, and profit margins
- **Property Comparison**: Rank properties by performance with trend indicators
- **Monthly Metrics**: Automated aggregation of monthly financial data

### Technical Features

- **Authentication**: Secure login with Google OAuth or email/password
- **Responsive UI**: Mobile-friendly interface with dark/light theme support
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Image Storage**: Property photos via Supabase Storage + AWS S3

## 💳 Subscription & Billing

Domari uses Stripe for subscription management with a 3-tier pricing model:

### Plans

| Plan         | Properties | Price (Monthly) | Price (Yearly)           |
| ------------ | ---------- | --------------- | ------------------------ |
| **Starter**  | Up to 10   | $9/month        | $90/year ($7.50/month)   |
| **Pro**      | Up to 50   | $29/month       | $290/year ($24.17/month) |
| **Business** | Unlimited  | $49/month       | $490/year ($40.83/month) |

### Features

- ✅ **14-day free trial** - No credit card required, full Business plan access
- ✅ **Stripe Payment Links** - Initial subscription via Stripe-hosted checkout
- ✅ **Billing Portal** - Self-service upgrades, downgrades, and cancellations
- ✅ **Webhook Handling** - Automatic subscription lifecycle management
- ✅ **Property Limits** - Enforced based on active subscription tier
- ✅ **Trial to Paid** - Seamless conversion with automatic limit adjustment

### Implementation

For detailed information about the Stripe integration, see [STRIPE_REUSABILITY_GUIDE.md](../STRIPE_REUSABILITY_GUIDE.md).

## Development Guidelines

For detailed coding standards and architecture patterns, see [CLAUDE.md](../CLAUDE.md).

**Key Rules:**

- Use shadcn/ui components (avoid custom UI)
- TailwindCSS v4 utilities only (no custom CSS)
- Zod schemas for all validation
- react-hook-form for forms
- Feature-based organization
- TypeScript strict mode (no `any` types)

## Troubleshooting

**Database Connection Issues:**

- Verify `DATABASE_URL` and `DIRECT_DATABASE_URL`
- Check database is accessible from your network
- Run `npm run db:generate` after schema changes

**Build Errors:**

- Run `npm run lint` to fix linting issues
- Check all environment variables are set
- Verify all imports are correct

**Authentication Issues:**

- Verify Google OAuth credentials
- Check `AUTH_SECRET` and `NEXTAUTH_URL`
- Ensure middleware.ts is properly configured

**Middleware / Edge Runtime Issues:**

- Middleware runs in Edge Runtime (no Node.js APIs)
- `auth.ts` uses Prisma/bcryptjs (Node.js only) - **DO NOT import in middleware**
- `middleware.ts` must use `auth.config.ts` (Edge-compatible)
- If you see "setImmediate is not defined" or similar errors, check middleware imports

**Subscription / Billing Issues:**

- Verify Stripe webhook secret matches production
- Check Stripe webhook endpoint is configured: `https://your-domain.com/api/billing/webhooks`
- Test webhooks locally: `stripe listen --forward-to localhost:3000/api/billing/webhooks`
- Verify all Stripe environment variables are set
- Check Stripe dashboard for failed webhook deliveries

## 📖 Documentation

- **[Root README](../README.md)** - Project overview and quick start
- **[CLAUDE.md](../CLAUDE.md)** - Architecture patterns and coding standards
- **[STRIPE_REUSABILITY_GUIDE.md](../STRIPE_REUSABILITY_GUIDE.md)** - Stripe integration details
- **[.env.example](./.env.example)** - Environment variable reference

## 📞 Support

For development questions and contribution guidelines, see [CLAUDE.md](../CLAUDE.md) or create an issue in the repository.

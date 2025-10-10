# Domari - Property Management App

Domari is a simple, powerful **property finance management tool** designed specifically for small landlords and property managers. We eliminate spreadsheet chaos by providing an intuitive platform to **track rental income, expenses, and generate tax-ready reports** — all in one place.

## 🏗 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM (Supabase)
- **Authentication**: NextAuth.js v5 with Google OAuth and credentials
- **UI**: TailwindCSS v4 + shadcn/ui + Radix UI primitives
- **Storage**: Supabase Storage + AWS S3
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

# Seed the database with categories
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

1. Modify Prisma schema in `/prisma/schema.prisma`
2. Run `npm run db:migrate -- --name descriptive_name` ⚠️ **Ask team first**
3. Update Prisma client: `npm run db:generate`
4. Test changes locally

### Adding Features

1. Create feature branch from `master`
2. Develop using established patterns (see CLAUDE.md)
3. Use shadcn/ui components when possible
4. Validate inputs with Zod schemas
5. Test functionality locally
6. Create pull request to `master`

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
   npx prisma migrate deploy

   # Seed categories (run once)
   npm run db:seed
   ```

3. **Deploy via Dashboard**

   - Push changes to `master` branch
   - Vercel auto-deploys from connected GitHub repository

4. **Deploy via CLI (Optional)**

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
│   ├── app/                 # App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (nondashboard)/ # Public pages
│   │   ├── dashboard/      # Protected dashboard pages
│   │   └── api/           # API routes
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── properties/    # Property-related components
│   │   └── transactions/  # Transaction components
│   ├── lib/               # Utilities and configurations
│   │   ├── db/           # Database queries
│   │   ├── services/     # API service functions
│   │   └── validations/  # Zod schemas
│   └── types/            # TypeScript type definitions
├── prisma/               # Database schema and migrations
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## Key Features

- **Property Management**: Add, edit, and track rental properties
- **Transaction Tracking**: Record income and expenses per property
- **Category System**: Pre-defined categories for tax reporting
- **Image Upload**: Property photos via Supabase Storage
- **Authentication**: Secure login with Google OAuth or credentials
- **Responsive UI**: Mobile-friendly interface with dark/light themes
- **Type Safety**: Full TypeScript implementation with Zod validation

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

## 📞 Support

For development questions and contribution guidelines, see [CLAUDE.md](../CLAUDE.md) or create an issue in the repository.

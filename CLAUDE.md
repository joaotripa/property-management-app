# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About Domari

Domari is a simple, powerful **property finance management tool** designed specifically for small landlords and property managers. We eliminate spreadsheet chaos by providing an intuitive platform to **track rental income, expenses, and generate tax-ready reports** — all in one place.

This document establishes coding conventions and best practices to ensure **clarity, consistency, and maintainability** across the entire project.

## Development Commands

Working Directory: All commands must be run from `/client` directory

### Database Operations

- Generate Prisma client: `npm run db:generate`
- Push schema changes to dev DB: `npm run db:push`
- Create new migration: `npm run db:migrate -- --name migration_name`
- Deploy migrations to production: `npx prisma migrate deploy`
- Open database browser: `npm run db:studio`
- Seed database: `npm run db:seed`

### Development Server

- Start development: `npm run dev` (runs on port 3000)
- Build application: `npm run build`
- Start production: `npm run start`
- Lint code: `npm run lint`
- Format code: `npx prettier --write .`
- Add shadcn/ui component: `npx shadcn@latest add [component-name]`

### Database Setup Process

1. Generate schema: `npm run db:generate`
2. Push schema: `npm run db:push`
3. Apply RLS policies: Copy `prisma/migrations/rls-policies.sql` to Supabase SQL Editor and run
4. Seed data: `npm run db:seed`

Important: Always ask before running database migration commands. Never reset the database.

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js v5 with Google OAuth and credentials
- **UI**: TailwindCSS v4 (no config file needed) with Radix UI primitives and shadcn/ui
- **Storage**: Supabase for file uploads and AWS S3
- **Validation**: Zod schemas
- **Forms**: react-hook-form with Zod resolvers

### Project Structure

- **Frontend**: Located in `/client` directory
- **Database**: Prisma schema at `/client/prisma/schema.prisma`
- **App Router**: Uses Next.js App Router with route groups
- **API Routes**: Located in `/client/src/app/api`
- **Services Layer**: API calls handled in `/client/src/lib/services`
- **Components**: Reusable UI elements in `/client/src/components`
- **Database Layer**: Prisma queries in `/client/src/lib/db`
- **Assets**: Images & media stored in Supabase Storage
- **Feature-based organization**: Group related files by domain (transactions, properties, users)

### Key Route Groups

- `(auth)`: Authentication pages (login, signup, etc.)
- `(nondashboard)`: Public pages (landing page, contact)
- `dashboard`: Protected user dashboard pages

### Database Schema

Core entities:

- **User**: Authentication and user management
- **Property**: Real estate properties with soft delete support
- **Transaction**: Income/expense tracking linked to properties
- **Category**: Transaction categorization system
- **Account/Session**: NextAuth.js authentication tables

Key relationships:

- Users own multiple Properties (1:N)
- Properties have multiple Transactions (1:N)
- Transactions belong to Categories (N:1)
- Soft delete implemented via `deletedAt` timestamps

### Authentication Flow

- NextAuth.js with JWT strategy
- Supports Google OAuth and credentials authentication
- Custom sign-in pages at `/login`
- Prisma adapter for session management
- User creation events logged via AuthLogger

### API Layer Architecture

#### Services Layer Pattern

All API operations use dedicated service functions:

- `transactionsService.ts`: Transaction CRUD and stats
- `propertiesService.ts`: Property management
- `categoriesService.ts`: Category operations

#### Validation Layer

- Zod schemas in `/lib/validations/` for type-safe validation
- Form validation with `@hookform/resolvers/zod`
- API request/response validation

#### Database Layer

- Queries and mutations separated in `/lib/db/[entity]/`
- Database operations abstracted from API routes
- Proper error handling and transaction support

### Frontend Rules & Patterns

#### UI Components

- **UI Library**: Use [shadcn/ui](https://ui.shadcn.com) - add with `npx shadcn@latest add [component]`
- **TailwindCSS v4**: Always prefer utility classes over custom CSS (no config file needed)
- **Theme Colors**: Always use theme colors from Tailwind's built-in design system
- **Modularity**: Build components for reuse across contexts
- **Accessibility**: Ensure ARIA labels and keyboard navigation
- **Code Formatting**: Use Prettier for consistent formatting

#### Form Components

- Built with shadcn/ui Form components
- `react-hook-form` for form state management
- `zod` resolvers for validation
- Consistent error handling patterns

#### Dialog Components

- Create/Edit/Delete dialogs for each entity
- Props-based data passing to avoid redundant API calls
- Proper loading states and error handling

#### Data Flow

- Parent components fetch shared data (categories, properties)
- Data passed as props to child dialogs to eliminate duplicate API calls
- Custom hooks for data fetching and state management
- Prefer server components and Next.js caching where possible

### File Upload System

- Supabase Storage for image uploads
- Supabase AWS S3 integration via `/lib/supabase/s3-client.ts`
- Property image management with CRUD operations

### Backend Rules & Patterns

#### API Architecture

- **API Routes**: Must be inside `/client/src/app/api`
- **Services Layer**: All API calls from frontend go through `/client/src/lib/services`
- **Database Queries**: Prisma queries defined in `/client/src/lib/db`
- **Validation**: Use `zod` in API routes to validate inputs before database queries
- **Error Handling**: Always handle errors gracefully - return consistent error shapes

#### Database Rules

- Prisma schema and client in `/client/prisma`
- Always run `npm run db:migrate` for schema changes (ASK FIRST)
- Never reset the database
- Handle drift/errors properly
- Query reuse: Make queries modular and reusable across services

#### Supabase Integration

- Use Supabase DB for structured data
- Use Supabase Storage for image/file uploads
- Always sanitize and validate uploaded files

### General Development Rules

#### Organization

- Group code by domain (transactions/, properties/), not just by type
- Feature-based component structure in `/components/[feature]/`
- Barrel exports for clean imports
- Reusable UI components in `/components/ui/`

#### Type Safety & Code Quality

- Strict TypeScript configuration
- Prisma-generated types for database entities
- Zod schemas for runtime validation + TypeScript inference
- Explicit typing for inputs/outputs
- Remove unused imports, variables, and dead code

#### Naming Conventions

- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Variables & functions: `camelCase`

#### Error Handling

- Service layer catches and transforms errors
- Consistent error response format
- Client-side error boundaries and toast notifications
- Never trust client input without validation

### Environment & Security

**Environment Files:**

- **Development**: `.env.local` (never commit to git)
- **Production**: Deployment platform environment variables (Vercel dashboard)
- **Git**: Add `.env*` to `.gitignore` (except `.env.example`)

**Required Variables:**

- See `/client/.env.example` for complete list and descriptions
- Copy `.env.example` to `.env.local` and fill in your actual values

**Security:**

- Protect API routes with proper auth (middleware)
- Never expose secrets in client-side code
- Use `NEXT_PUBLIC_` prefix only for safe client-side variables

### Key Files to Understand

- `/client/src/auth.ts`: NextAuth.js configuration
- `/client/prisma/schema.prisma`: Database schema
- `/client/src/lib/db/`: Database operation layers
- `/client/src/lib/services/`: API service layers
- `/client/src/lib/validations/`: Zod validation schemas
- `/client/prisma/seed.ts`: Database seeding with property categories

### Migration Workflow

1. Modify Prisma schema
2. Run `npm run db:migrate -- --name descriptive_name` (⚠️ ASK FIRST)
3. Update Prisma client: `npm run db:generate`
4. For production: `npx prisma migrate deploy`
5. Apply any RLS policies manually in Supabase if needed

## Deployment

- **Hosting Platform**: Vercel (production deployment)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage + AWS S3

## Production Readiness Guidelines

- Code must be maintainable, readable, and production-ready
- Follow Next.js and React best practices for SSR and static generation
- Optimize queries and components for performance
- Ensure error logging and monitoring are in place
- Never over-engineer - favor clarity and readability

## Quality Checklist

When working on this codebase:

- ✅ Use shadcn/ui components instead of building custom ones (Unless strictly necessary to accomplish the requirements)
- ✅ Validate all inputs with Zod schemas
- ✅ Use react-hook-form for all forms
- ✅ Pass data as props to avoid redundant API calls
- ✅ Follow feature-based organization
- ✅ Use TypeScript strictly - no `any` types
- ✅ Handle errors gracefully with consistent patterns
- ✅ Ask before running database migrations
- ✅ Use TailwindCSS utilities (no custom CSS)
- ✅ Keep components modular and reusable

---

**Remember**: Domari's success depends on a clean, consistent, and reliable codebase. When in doubt: **Keep it simple, modular, validated, and consistent with the theme.**
